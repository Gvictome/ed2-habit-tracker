/**
 * Goal progress, derived from check-ins the same way levels are.
 *
 * A goal counts only activity from the day it was set, so a new goal starts
 * at zero instead of being half-finished by old history. Nothing here is
 * stored: delete a check-in and every goal that depended on it updates.
 */

import { addDaysToKey, calculateBestStreak, calculateStreak, daysBetweenKeys, toDayKey } from './dates'
import { completedDays, isMeasured } from './habits'
import type { Goal, GoalKind, Habit } from './types'

export type GoalStatus = 'complete' | 'on_track' | 'behind' | 'overdue' | 'no_deadline'

export interface GoalProgress {
  current: number
  target: number
  ratio: number
  remaining: number
  isComplete: boolean
  status: GoalStatus
  /** YYYY-MM-DD the goal should finish at the current pace, or null if there is no pace yet. */
  projectedDate: string | null
  /** Days until the deadline (negative once passed), or null without one. */
  daysLeft: number | null
  startedOn: string
}

export const GOAL_KIND_LABELS: Record<GoalKind, string> = {
  total_days: 'Total days',
  total_amount: 'Total amount',
  streak: 'Streak',
}

export function goalKindsFor(habit: Habit): GoalKind[] {
  return isMeasured(habit) ? ['total_days', 'total_amount', 'streak'] : ['total_days', 'streak']
}

function measure(goal: Goal, habit: Habit, startKey: string, todayKey: string) {
  const doneSince = completedDays(habit).filter((day) => day >= startKey)

  if (goal.kind === 'total_amount') {
    const current = habit.check_ins
      .filter((entry) => entry.day >= startKey)
      .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0)
    return { current, isComplete: current >= goal.target }
  }

  if (goal.kind === 'streak') {
    const best = calculateBestStreak(doneSince)
    const isComplete = best >= goal.target
    const live = calculateStreak(doneSince, new Date(`${todayKey}T12:00:00`))
    return { current: isComplete ? best : live, isComplete, isDoneToday: doneSince.includes(todayKey) }
  }

  return { current: doneSince.length, isComplete: doneSince.length >= goal.target }
}

function project(
  goal: Goal,
  current: number,
  remaining: number,
  elapsedDays: number,
  todayKey: string,
  isDoneToday: boolean,
): string | null {
  if (remaining <= 0) return null
  if (goal.kind === 'streak') {
    // Keep going every day: today counts if it is not already logged.
    return addDaysToKey(todayKey, isDoneToday ? remaining : remaining - 1)
  }
  if (current <= 0) return null
  const perDay = current / elapsedDays
  return addDaysToKey(todayKey, Math.ceil(remaining / perDay))
}

function statusFor(
  isComplete: boolean,
  deadline: string | null,
  daysLeft: number | null,
  projectedDate: string | null,
): GoalStatus {
  if (isComplete) return 'complete'
  if (!deadline || daysLeft === null) return 'no_deadline'
  if (daysLeft < 0) return 'overdue'
  if (projectedDate && projectedDate <= deadline) return 'on_track'
  return 'behind'
}

export function goalProgress(goal: Goal, habit: Habit, now: Date = new Date()): GoalProgress {
  const todayKey = toDayKey(now)
  const startKey = toDayKey(new Date(goal.created_at))
  const target = Number(goal.target)
  const measured = measure({ ...goal, target }, habit, startKey, todayKey)
  const current = Math.round(measured.current * 100) / 100
  const remaining = Math.max(0, Math.round((target - current) * 100) / 100)
  const elapsedDays = Math.max(1, daysBetweenKeys(startKey, todayKey) + 1)

  const projectedDate = measured.isComplete
    ? null
    : project(goal, current, remaining, elapsedDays, todayKey, Boolean(measured.isDoneToday))
  const daysLeft = goal.deadline ? daysBetweenKeys(todayKey, goal.deadline) : null

  return {
    current,
    target,
    ratio: Math.min(1, target > 0 ? current / target : 0),
    remaining: measured.isComplete ? 0 : remaining,
    isComplete: measured.isComplete,
    status: statusFor(measured.isComplete, goal.deadline, daysLeft, projectedDate),
    projectedDate,
    daysLeft,
    startedOn: startKey,
  }
}
