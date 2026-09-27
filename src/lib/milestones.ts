/**
 * Milestones: badges earned automatically as habits build up.
 *
 * Like levels and goals they are derived from check-ins, never stored. Each one
 * records the exact day it was earned, found by replaying the completed days in
 * order, so the timeline stays truthful if old days are edited.
 */

import { daysBetweenKeys } from './dates'
import { completedDays } from './habits'
import type { Habit } from './types'

export const STREAK_THRESHOLDS = [3, 7, 14, 30, 60, 100, 365]
export const TOTAL_THRESHOLDS = [1, 10, 25, 50, 100, 250, 500]
export const OVERALL_THRESHOLDS = [10, 50, 100, 250, 500, 1000]

export type MilestoneKind = 'streak' | 'total' | 'overall'

export interface Milestone {
  id: string
  kind: MilestoneKind
  habitId: string | null
  habitName: string | null
  threshold: number
  title: string
  description: string
  /** YYYY-MM-DD it was earned, or null if not yet. */
  achievedOn: string | null
  /** 0 to 1 toward earning it. */
  progress: number
}

/** The day each streak length was first reached, keyed by length. */
function streakReachedOn(sortedDays: string[]): Map<number, string> {
  const reached = new Map<number, string>()
  let run = 0
  for (let index = 0; index < sortedDays.length; index += 1) {
    const isConsecutive = index > 0 && daysBetweenKeys(sortedDays[index - 1], sortedDays[index]) === 1
    run = isConsecutive ? run + 1 : 1
    if (!reached.has(run)) reached.set(run, sortedDays[index])
  }
  return reached
}

function streakTitle(threshold: number): string {
  if (threshold >= 365) return 'Year of fire'
  if (threshold >= 100) return 'Century'
  if (threshold >= 30) return `${threshold}-day streak`
  return `${threshold} in a row`
}

export function habitMilestones(habit: Habit): Milestone[] {
  const days = [...new Set(completedDays(habit))].sort()
  const reached = streakReachedOn(days)
  const bestRun = reached.size > 0 ? Math.max(...reached.keys()) : 0

  const streaks = STREAK_THRESHOLDS.map((threshold) => ({
    id: `${habit.id}:streak:${threshold}`,
    kind: 'streak' as const,
    habitId: habit.id,
    habitName: habit.name,
    threshold,
    title: streakTitle(threshold),
    description: `${habit.name}: ${threshold} days in a row`,
    achievedOn: reached.get(threshold) ?? null,
    progress: Math.min(1, bestRun / threshold),
  }))

  const totals = TOTAL_THRESHOLDS.map((threshold) => ({
    id: `${habit.id}:total:${threshold}`,
    kind: 'total' as const,
    habitId: habit.id,
    habitName: habit.name,
    threshold,
    title: threshold === 1 ? 'First step' : `${threshold} days done`,
    description: `${habit.name}: ${threshold} completed ${threshold === 1 ? 'day' : 'days'}`,
    achievedOn: days[threshold - 1] ?? null,
    progress: Math.min(1, days.length / threshold),
  }))

  return [...streaks, ...totals]
}

export function overallMilestones(habits: Habit[]): Milestone[] {
  // Every completion across every habit, oldest first. Two habits done on the
  // same day are two completions.
  const all = habits.flatMap((habit) => completedDays(habit)).sort()
  return OVERALL_THRESHOLDS.map((threshold) => ({
    id: `all:total:${threshold}`,
    kind: 'overall' as const,
    habitId: null,
    habitName: null,
    threshold,
    title: `${threshold} check-ins`,
    description: `${threshold} completions across all habits`,
    achievedOn: all[threshold - 1] ?? null,
    progress: Math.min(1, all.length / threshold),
  }))
}

export function allMilestones(habits: Habit[]): Milestone[] {
  return [...overallMilestones(habits), ...habits.flatMap(habitMilestones)]
}

/** Earned milestones, newest first. */
export function earnedMilestones(habits: Habit[]): Milestone[] {
  return allMilestones(habits)
    .filter((milestone) => milestone.achievedOn !== null)
    .sort((a, b) => (b.achievedOn ?? '').localeCompare(a.achievedOn ?? '') || b.threshold - a.threshold)
}

/** The unearned milestones closest to done. */
export function nextMilestones(habits: Habit[], limit = 3): Milestone[] {
  return allMilestones(habits)
    .filter((milestone) => milestone.achievedOn === null)
    .sort((a, b) => b.progress - a.progress || a.threshold - b.threshold)
    .slice(0, limit)
}
