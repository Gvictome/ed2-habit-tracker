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
 *   - every check-in ever is worth XP_PER_CHECK_IN        (rewards depth)
 *   - every day of a live streak adds XP_PER_STREAK_DAY   (rewards right now)
 *   - each cold habit costs XP_COLD_PENALTY               (punishes neglect)
 *   - if MOST habits are cold the whole total is cut      (the demotion)
 */

import { calculateStreak, toDayKey } from './dates'

export const XP_PER_CHECK_IN = 10
export const XP_PER_STREAK_DAY = 5
export const XP_COLD_PENALTY = 50
export const MAJORITY_COLD_MULTIPLIER = 0.75

/** Slack, in days, on top of a habit's own expected spacing before it is cold. */
export const COLD_GRACE_DAYS = 2

const DAY_MS = 24 * 60 * 60 * 1000

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
export function xpForLevel(level) {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

export function levelFromXp(xp) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level += 1
  return level
}

export function titleForLevel(level) {
  return TIERS.reduce((best, tier) => (level >= tier.from ? tier.title : best), TIERS[0].title)
}

function daysBetween(fromKey, toDate) {
  const [year, month, day] = fromKey.split('-').map(Number)
  const from = new Date(year, month - 1, day)
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  return Math.round((to - from) / DAY_MS)
}

/**
 * How long a habit may go quiet before it counts as cold.
 *
 * Scaled to its own target, so a three-times-a-week habit is not punished for
 * the two days off it was always meant to take.
 */
export function coldThresholdDays(targetPerWeek) {
  const expectedGap = Math.ceil(7 / Math.max(targetPerWeek, 1))
  return expectedGap + COLD_GRACE_DAYS
}

/**
 * Days since the habit last saw action. A habit with no check-ins yet is
 * measured from when it was created, so a brand-new habit is not born cold.
 */
export function daysSinceActivity(habit, now = new Date()) {
  const days = habit.check_ins.map((checkIn) => checkIn.day)
  if (days.length > 0) {
    return daysBetween(days.reduce((a, b) => (a > b ? a : b)), now)
  }
  const created = habit.created_at ? new Date(habit.created_at) : now
  return daysBetween(toDayKey(created), now)
}

export function isCold(habit, now = new Date()) {
  return daysSinceActivity(habit, now) >= coldThresholdDays(habit.target_per_week)
}

/**
 * The whole picture: XP, level, how far into the level, and whether enough
 * habits have gone quiet to drag the score down.
 */
export function calculateProgress(habits, now = new Date()) {
  const totalCheckIns = habits.reduce((sum, habit) => sum + habit.check_ins.length, 0)
  const streakDays = habits.reduce(
    (sum, habit) => sum + calculateStreak(habit.check_ins.map((checkIn) => checkIn.day)),
    0,
  )
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
