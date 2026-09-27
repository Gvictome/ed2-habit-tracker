'use client'

/**
 * Every browser-side Supabase call lives here, so components never talk to
 * the database directly and the query shapes sit in one place.
 *
 * Each function returns Supabase's { data, error } shape. Row Level Security
 * already scopes every read and write to the signed-in user; passing user_id
 * explicitly keeps the intent visible and satisfies the insert policies.
 */

import { ENTRY_COLUMNS, GOAL_COLUMNS, HABIT_COLUMNS, PROFILE_COLUMNS } from './queries'
import { getBrowserClient } from './supabase/client'
import type { CheckIn, Goal, GoalInput, Habit, HabitInput, Profile } from './types'

/** Postgres numeric can arrive as a string; normalise so the UI can do math. */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normaliseEntry(entry: CheckIn): CheckIn {
  return { ...entry, value: toNumberOrNull(entry.value), note: entry.note ?? '' }
}

export function normaliseHabit(habit: Habit): Habit {
  return {
    ...habit,
    kind: habit.kind ?? 'check',
    unit: habit.unit ?? '',
    icon: habit.icon ?? '',
    daily_target: toNumberOrNull(habit.daily_target),
    check_ins: (habit.check_ins ?? []).map(normaliseEntry),
  }
}

export function normaliseGoal(goal: Goal): Goal {
  return { ...goal, target: Number(goal.target) }
}

export function normaliseEntryRow(entry: CheckIn): CheckIn {
  return normaliseEntry(entry)
}

function habitRow(habit: HabitInput) {
  const isMeasure = habit.kind === 'measure'
  return {
    name: habit.name.trim(),
    description: habit.description.trim(),
    color: habit.color,
    icon: habit.icon,
    kind: habit.kind,
    unit: isMeasure ? habit.unit.trim() : '',
    daily_target: isMeasure ? habit.dailyTarget : null,
    target_per_week: habit.targetPerWeek,
  }
}

// ---------------------------------------------------------------- habits ---

export async function fetchHabits(userId: string) {
  return getBrowserClient()
    .from('habits')
    .select(HABIT_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .returns<Habit[]>()
}

export async function createHabit(userId: string, habit: HabitInput) {
  return getBrowserClient()
    .from('habits')
    .insert({ user_id: userId, ...habitRow(habit) })
    .select(HABIT_COLUMNS)
    .single<Habit>()
}

export async function updateHabit(habitId: string, habit: HabitInput) {
  return getBrowserClient()
    .from('habits')
    .update(habitRow(habit))
    .eq('id', habitId)
    .select(HABIT_COLUMNS)
    .single<Habit>()
}

/** Cascades to the habit's check-ins and goals via foreign keys. */
export async function deleteHabit(habitId: string) {
  return getBrowserClient().from('habits').delete().eq('id', habitId)
}

// ------------------------------------------------------------- check-ins ---

/** Creates or replaces the one entry a habit can have per day. */
export async function upsertEntry(
  userId: string,
  habitId: string,
  day: string,
  fields: { value: number | null; note: string },
) {
  return getBrowserClient()
    .from('check_ins')
    .upsert(
      { user_id: userId, habit_id: habitId, day, value: fields.value, note: fields.note.trim() },
      { onConflict: 'habit_id,day' },
    )
    .select(ENTRY_COLUMNS)
    .single<CheckIn>()
}

export async function removeEntry(habitId: string, day: string) {
  return getBrowserClient().from('check_ins').delete().eq('habit_id', habitId).eq('day', day)
}

// ----------------------------------------------------------------- goals ---

export async function fetchGoals(userId: string) {
  return getBrowserClient()
    .from('goals')
    .select(GOAL_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<Goal[]>()
}

function goalRow(goal: GoalInput) {
  return {
    habit_id: goal.habitId,
    title: goal.title.trim(),
    kind: goal.kind,
    target: goal.target,
    deadline: goal.deadline || null,
  }
}

export async function createGoal(userId: string, goal: GoalInput) {
  return getBrowserClient()
    .from('goals')
    .insert({ user_id: userId, ...goalRow(goal) })
    .select(GOAL_COLUMNS)
    .single<Goal>()
}

export async function updateGoal(goalId: string, goal: GoalInput) {
  return getBrowserClient()
    .from('goals')
    .update(goalRow(goal))
    .eq('id', goalId)
    .select(GOAL_COLUMNS)
    .single<Goal>()
}

export async function deleteGoal(goalId: string) {
  return getBrowserClient().from('goals').delete().eq('id', goalId)
}

// --------------------------------------------------------------- profile ---

export async function saveProfile(userId: string, fields: Partial<Omit<Profile, 'id'>>) {
  return getBrowserClient()
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select(PROFILE_COLUMNS)
    .single<Profile>()
}

export async function changePassword(password: string) {
  return getBrowserClient().auth.updateUser({ password })
}

/** Removes the auth user; every habit, check-in, goal, and profile cascades with it. */
export async function deleteOwnAccount() {
  return getBrowserClient().rpc('delete_own_account')
}
