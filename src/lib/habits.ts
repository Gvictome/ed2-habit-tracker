/**
 * What "done" means for a habit.
 *
 * A check habit is done on any day that has a check-in row. A measured habit
 * stores the amount on that row, and the day only counts once the amount
 * reaches the habit's daily target. Streaks, levels, goals, and milestones all
 * go through completedDays(), so that rule lives in exactly one place.
 */

import {
  calculateBestStreak,
  calculateStreak,
  countThisWeek,
  daysBetweenKeys,
  isCompletedToday,
  recentDays,
  toDayKey,
} from './dates'
import type { CheckIn, Habit } from './types'

export const COMPLETION_WINDOW_DAYS = 30

export function isMeasured(habit: Habit): boolean {
  return habit.kind === 'measure'
}

export function isEntryDone(habit: Habit, entry: CheckIn): boolean {
  if (!isMeasured(habit)) return true
  const target = Number(habit.daily_target ?? 0)
  return target > 0 && Number(entry.value ?? 0) >= target
}

export function completedDays(habit: Habit): string[] {
  return habit.check_ins.filter((entry) => isEntryDone(habit, entry)).map((entry) => entry.day)
}

export function entryFor(habit: Habit, day: string): CheckIn | undefined {
  return habit.check_ins.find((entry) => entry.day === day)
}

/** 0 to 1: how much of the day's target is met. Drives partial ring fills. */
export function dayProgress(habit: Habit, day: string): number {
  const entry = entryFor(habit, day)
  if (!entry) return 0
  if (!isMeasured(habit)) return 1
  const target = Number(habit.daily_target ?? 0)
  if (target <= 0) return 0
  return Math.min(1, Number(entry.value ?? 0) / target)
}

export function totalAmount(habit: Habit): number {
  return habit.check_ins.reduce((sum, entry) => sum + Number(entry.value ?? 0), 0)
}

export interface HabitStats {
  streak: number
  bestStreak: number
  totalDays: number
  thisWeek: number
  isDoneToday: boolean
  todayProgress: number
  /** Share of the expected days hit over the last 30 days (or since creation), capped at 1. */
  completionRate: number
  totalAmount: number
}

export function habitStats(habit: Habit, now: Date = new Date()): HabitStats {
  const days = completedDays(habit)
  const todayKey = toDayKey(now)
  const age = daysBetweenKeys(toDayKey(new Date(habit.created_at)), todayKey) + 1
  const windowDays = Math.max(1, Math.min(COMPLETION_WINDOW_DAYS, age))
  const window = new Set(recentDays(windowDays, now).map((day) => day.key))
  const doneInWindow = days.filter((day) => window.has(day)).length
  const expected = (habit.target_per_week * windowDays) / 7

  return {
    streak: calculateStreak(days, now),
    bestStreak: calculateBestStreak(days),
    totalDays: days.length,
    thisWeek: countThisWeek(days, now),
    isDoneToday: isCompletedToday(days, now),
    todayProgress: dayProgress(habit, todayKey),
    completionRate: expected > 0 ? Math.min(1, doneInWindow / expected) : 0,
    totalAmount: totalAmount(habit),
  }
}

/** "8 glasses", "1 time" - quantity plus unit, with trailing zeros trimmed. */
export function formatAmount(value: number, unit = ''): string {
  const rounded = Math.round(value * 100) / 100
  return unit ? `${rounded} ${unit}` : String(rounded)
}
