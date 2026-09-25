'use client'

/**
 * Owns the signed-in user's habits, goals, and profile, plus every mutation.
 *
 * The server layout fetches the first snapshot (so pages render with data, no
 * spinner), and this provider takes over from there. Check-ins update the
 * screen immediately and roll back if the write fails. Every state update
 * builds new arrays rather than mutating, so React always sees the change.
 */

import { useTheme } from 'next-themes'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import * as api from '@/lib/api'
import { describeError } from '@/lib/errors'
import { entryFor } from '@/lib/habits'
import { earnedMilestones } from '@/lib/milestones'
import type { CheckIn, Goal, GoalInput, Habit, HabitInput, Profile } from '@/lib/types'

export interface SessionUser {
  id: string
  email: string
}

interface DataContextValue {
  user: SessionUser
  profile: Profile
  habits: Habit[]
  goals: Goal[]
  addHabit: (input: HabitInput) => Promise<Habit | null>
  editHabit: (habitId: string, input: HabitInput) => Promise<boolean>
  removeHabit: (habitId: string) => Promise<boolean>
  toggleCheck: (habitId: string, day: string) => Promise<void>
  saveEntry: (habitId: string, day: string, fields: { value: number | null; note: string }) => Promise<boolean>
  clearEntry: (habitId: string, day: string) => Promise<boolean>
  addGoal: (input: GoalInput) => Promise<boolean>
  editGoal: (goalId: string, input: GoalInput) => Promise<boolean>
  removeGoal: (goalId: string) => Promise<boolean>
  updateProfile: (fields: Partial<Omit<Profile, 'id'>>) => Promise<boolean>
  reload: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function useData(): DataContextValue {
  const value = useContext(DataContext)
  if (!value) throw new Error('useData must be used inside <DataProvider>')
  return value
}

function withEntry(habits: Habit[], habitId: string, day: string, entry: CheckIn | null): Habit[] {
  return habits.map((habit) => {
    if (habit.id !== habitId) return habit
    const others = habit.check_ins.filter((item) => item.day !== day)
    return { ...habit, check_ins: entry ? [...others, entry] : others }
  })
}

function reportError(error: { message?: string } | null, fallback: string): false {
  toast.error(describeError(error, fallback) ?? fallback)
  return false
}

interface DataProviderProps {
  user: SessionUser
  initialProfile: Profile
  initialHabits: Habit[]
  initialGoals: Goal[]
  children: React.ReactNode
}

export function DataProvider({ user, initialProfile, initialHabits, initialGoals, children }: DataProviderProps) {
  const [habits, setHabits] = useState<Habit[]>(() => initialHabits.map(api.normaliseHabit))
  const [goals, setGoals] = useState<Goal[]>(() => initialGoals.map(api.normaliseGoal))
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const { theme, setTheme } = useTheme()

  // The saved theme follows the user to every device.
  useEffect(() => {
    if (theme !== initialProfile.theme) setTheme(initialProfile.theme)
    // Only on first mount: afterwards the settings page drives both.
  }, []) // oxlint-disable-line react-hooks/exhaustive-deps

  // Celebrate milestones the moment they are earned, but not the backlog on load.
  const seenMilestones = useRef<Set<string> | null>(null)
  useEffect(() => {
    const earned = earnedMilestones(habits)
    if (seenMilestones.current) {
      const fresh = earned.filter((milestone) => !seenMilestones.current?.has(milestone.id))
      fresh.slice(0, 2).forEach((milestone) =>
        toast.success(`Milestone unlocked: ${milestone.title}`, { description: milestone.description, icon: '🏆' }),
      )
    }
    // Union, not replace: undoing and redoing a check-in should not re-celebrate.
    seenMilestones.current = new Set([...(seenMilestones.current ?? []), ...earned.map((milestone) => milestone.id)])
  }, [habits])

  const reload = useCallback(async () => {
    const [habitResult, goalResult] = await Promise.all([api.fetchHabits(user.id), api.fetchGoals(user.id)])
    if (habitResult.error) return void reportError(habitResult.error, 'Could not load your habits.')
    if (goalResult.error) return void reportError(goalResult.error, 'Could not load your goals.')
    setHabits((habitResult.data ?? []).map(api.normaliseHabit))
    setGoals((goalResult.data ?? []).map(api.normaliseGoal))
  }, [user.id])

  const addHabit = useCallback(
    async (input: HabitInput) => {
      const { data, error } = await api.createHabit(user.id, input)
      if (error || !data) return reportError(error, 'Could not save that habit.') || null
      const habit = api.normaliseHabit(data)
      setHabits((current) => [...current, habit])
      toast.success(`${input.icon ? `${input.icon} ` : ''}${habit.name} added`)
      return habit
    },
    [user.id],
  )

  const editHabit = useCallback(async (habitId: string, input: HabitInput) => {
    const { data, error } = await api.updateHabit(habitId, input)
    if (error || !data) return reportError(error, 'Could not update that habit.')
    const updated = api.normaliseHabit(data)
    setHabits((current) => current.map((habit) => (habit.id === habitId ? updated : habit)))
    toast.success('Habit updated')
    return true
  }, [])

  const removeHabit = useCallback(async (habitId: string) => {
    const { error } = await api.deleteHabit(habitId)
    if (error) return reportError(error, 'Could not delete that habit.')
    setHabits((current) => current.filter((habit) => habit.id !== habitId))
    setGoals((current) => current.filter((goal) => goal.habit_id !== habitId))
    toast.success('Habit deleted')
    return true
  }, [])

  // Latest habits for callbacks that need to read state without re-creating on every change.
  const habitsRef = useRef(habits)
  useEffect(() => {
    habitsRef.current = habits
  }, [habits])

  const saveEntry = useCallback(
    async (habitId: string, day: string, fields: { value: number | null; note: string }) => {
      const previous = habitsRef.current
      const existing = previous.find((habit) => habit.id === habitId)
      const existingEntry = existing ? entryFor(existing, day) : undefined
      const optimistic: CheckIn = { id: existingEntry?.id ?? `pending-${day}`, day, ...fields }
      setHabits((current) => withEntry(current, habitId, day, optimistic))

      const { data, error } = await api.upsertEntry(user.id, habitId, day, fields)
      if (error || !data) {
        setHabits(previous)
        return reportError(error, 'Could not save that day.')
      }
      setHabits((current) => withEntry(current, habitId, day, api.normaliseEntryRow(data)))
      return true
    },
    [user.id],
  )

  const clearEntry = useCallback(async (habitId: string, day: string) => {
    const previous = habitsRef.current
    setHabits((current) => withEntry(current, habitId, day, null))
    const { error } = await api.removeEntry(habitId, day)
    if (error) {
      setHabits(previous)
      return reportError(error, 'Could not update that day.')
    }
    return true
  }, [])

  /** Checks a day on if it is off, and off if it is on. */
  const toggleCheck = useCallback(
    async (habitId: string, day: string) => {
      const habit = habitsRef.current.find((item) => item.id === habitId)
      if (!habit) return
      if (entryFor(habit, day)) await clearEntry(habitId, day)
      else await saveEntry(habitId, day, { value: null, note: '' })
    },
    [clearEntry, saveEntry],
  )

  const addGoal = useCallback(
    async (input: GoalInput) => {
      const { data, error } = await api.createGoal(user.id, input)
      if (error || !data) return reportError(error, 'Could not save that goal.')
      setGoals((current) => [api.normaliseGoal(data), ...current])
      toast.success('Goal set', { description: input.title })
      return true
    },
    [user.id],
  )

  const editGoal = useCallback(async (goalId: string, input: GoalInput) => {
    const { data, error } = await api.updateGoal(goalId, input)
    if (error || !data) return reportError(error, 'Could not update that goal.')
    setGoals((current) => current.map((goal) => (goal.id === goalId ? api.normaliseGoal(data) : goal)))
    toast.success('Goal updated')
    return true
  }, [])

  const removeGoal = useCallback(async (goalId: string) => {
    const { error } = await api.deleteGoal(goalId)
    if (error) return reportError(error, 'Could not delete that goal.')
    setGoals((current) => current.filter((goal) => goal.id !== goalId))
    toast.success('Goal removed')
    return true
  }, [])

  const updateProfile = useCallback(
    async (fields: Partial<Omit<Profile, 'id'>>) => {
      const previous = profile
      setProfile((current) => ({ ...current, ...fields }))
      if (fields.theme) setTheme(fields.theme)
      const { data, error } = await api.saveProfile(user.id, fields)
      if (error || !data) {
        setProfile(previous)
        if (fields.theme) setTheme(previous.theme)
        return reportError(error, 'Could not save your settings.')
      }
      setProfile(data)
      return true
    },
    [profile, setTheme, user.id],
  )

  const value = useMemo<DataContextValue>(
    () => ({
      user,
      profile,
      habits,
      goals,
      addHabit,
      editHabit,
      removeHabit,
      toggleCheck,
      saveEntry,
      clearEntry,
      addGoal,
      editGoal,
      removeGoal,
      updateProfile,
      reload,
    }),
    [user, profile, habits, goals, addHabit, editHabit, removeHabit, toggleCheck, saveEntry, clearEntry, addGoal, editGoal, removeGoal, updateProfile, reload],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
