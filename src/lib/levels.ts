/**
 * The level system.
 *
 * Level is DERIVED from check-ins rather than stored as an accumulating XP
 * column. That is deliberate: the level has to be able to fall when someone
 * stops showing up, and a derived score falls on its own. A stored balance
 * would need a scheduled job to decay it, and would drift the moment a write
 * failed. Recomputing from the rows is cheap and always agrees with the data.
 *
 * The shape of the score:
 *   - every completed day ever is worth XP_PER_CHECK_IN   (rewards depth)
 *   - every day of a live streak adds XP_PER_STREAK_DAY   (rewards right now)
 *   - each cold habit costs XP_COLD_PENALTY               (punishes neglect)
 *   - if MOST habits are cold the whole total is cut      (the demotion)
 *
 * A measured day that fell short of its target is logged but not completed,
 * so it earns nothing and does not keep a habit warm.
 */

import { calculateStreak, daysBetweenKeys, toDayKey } from './dates'
import { completedDays } from './habits'
import type { Habit } from './types'

export const XP_PER_CHECK_IN = 10
export const XP_PER_STREAK_DAY = 5
export const XP_COLD_PENALTY = 50
export const MAJORITY_COLD_MULTIPLIER = 0.75

/** Slack, in days, on top of a habit's own expected spacing before it is cold. */
export const COLD_GRACE_DAYS = 2

const TIERS = [
  { from: 1, title: 'Getting started' },
  { from: 3, title: 'Warming up' },
  { from: 5, title: 'Consistent' },
  { from: 8, title: 'Dedicated' },
  { from: 12, title: 'Relentless' },
  { from: 18, title: 'Unstoppable' },
]

/**
 * Total XP needed to REACH a level. Level 1 is the floor, and each level costs
 * 100 XP more than the one before: 0, 100, 300, 600, 1000, 1500...
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level += 1
  return level
}

export function titleForLevel(level: number): string {
  return TIERS.reduce((best, tier) => (level >= tier.from ? tier.title : best), TIERS[0].title)
}

/**
 * How long a habit may go quiet before it counts as cold.
 *
 * Scaled to its own target, so a three-times-a-week habit is not punished for
 * the two days off it was always meant to take.
 */
export function coldThresholdDays(targetPerWeek: number): number {
  const expectedGap = Math.ceil(7 / Math.max(targetPerWeek, 1))
  return expectedGap + COLD_GRACE_DAYS
}

/**
 * Days since the habit last saw a completed day. A habit with none yet is
 * measured from when it was created, so a brand-new habit is not born cold.
 */
export function daysSinceActivity(habit: Habit, now: Date = new Date()): number {
  const days = completedDays(habit)
  const todayKey = toDayKey(now)
  if (days.length > 0) {
    return daysBetweenKeys(days.reduce((a, b) => (a > b ? a : b)), todayKey)
  }
  const created = habit.created_at ? new Date(habit.created_at) : now
  return daysBetweenKeys(toDayKey(created), todayKey)
}

export function isCold(habit: Habit, now: Date = new Date()): boolean {
  return daysSinceActivity(habit, now) >= coldThresholdDays(habit.target_per_week)
}

export interface LevelProgress {
  xp: number
  level: number
  title: string
  xpIntoLevel: number
  xpForNextLevel: number
  xpToNextLevel: number
  progressRatio: number
  totalCheckIns: number
  streakDays: number
  coldCount: number
  coldNames: string[]
  totalHabits: number
  isCoolingOff: boolean
}

/**
 * The whole picture: XP, level, how far into the level, and whether enough
 * habits have gone quiet to drag the score down.
 */
export function calculateProgress(habits: Habit[], now: Date = new Date()): LevelProgress {
  const doneByHabit = habits.map((habit) => completedDays(habit))
  const totalCheckIns = doneByHabit.reduce((sum, days) => sum + days.length, 0)
  const streakDays = doneByHabit.reduce((sum, days) => sum + calculateStreak(days, now), 0)
  const coldHabits = habits.filter((habit) => isCold(habit, now))
  const isCoolingOff = habits.length > 0 && coldHabits.length > habits.length / 2

  const earned = totalCheckIns * XP_PER_CHECK_IN + streakDays * XP_PER_STREAK_DAY
  const afterPenalty = earned - coldHabits.length * XP_COLD_PENALTY
  const multiplied = isCoolingOff ? afterPenalty * MAJORITY_COLD_MULTIPLIER : afterPenalty
  const xp = Math.max(0, Math.round(multiplied))

  const level = levelFromXp(xp)
  const floor = xpForLevel(level)
  const ceiling = xpForLevel(level + 1)

  return {
    xp,
    level,
    title: titleForLevel(level),
    xpIntoLevel: xp - floor,
    xpForNextLevel: ceiling - floor,
    xpToNextLevel: ceiling - xp,
    progressRatio: (xp - floor) / (ceiling - floor),
    totalCheckIns,
    streakDays,
    coldCount: coldHabits.length,
    coldNames: coldHabits.map((habit) => habit.name),
    totalHabits: habits.length,
    isCoolingOff,
  }
}
