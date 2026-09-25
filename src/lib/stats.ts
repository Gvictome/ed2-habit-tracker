/**
 * Chart data for the Insights page: a contribution-style heatmap across every
 * habit, and a per-day value series for one habit.
 */

import { formatShortDate, recentDays, shiftDays, startOfWeek, toDayKey } from './dates'
import { completedDays, entryFor, isMeasured } from './habits'
import type { Habit } from './types'

export interface HeatCell {
  key: string
  /** Share of habits that existed that day which were completed. */
  ratio: number
  done: number
  possible: number
  isFuture: boolean
  isToday: boolean
}

/** `weeks` columns of 7 days, oldest first, each column starting on `weekStart`. */
export function heatmap(
  habits: Habit[],
  weeks = 12,
  weekStart: 0 | 1 = 1,
  now: Date = new Date(),
): HeatCell[][] {
  const todayKey = toDayKey(now)
  const firstDay = shiftDays(startOfWeek(now, weekStart), -7 * (weeks - 1))
  const doneSets = habits.map((habit) => ({
    createdKey: toDayKey(new Date(habit.created_at)),
    done: new Set(completedDays(habit)),
  }))

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const key = toDayKey(shiftDays(firstDay, week * 7 + weekday))
      const existing = doneSets.filter((habit) => habit.createdKey <= key)
      const done = existing.filter((habit) => habit.done.has(key)).length
      return {
        key,
        ratio: existing.length > 0 ? done / existing.length : 0,
        done,
        possible: existing.length,
        isFuture: key > todayKey,
        isToday: key === todayKey,
      }
    }),
  )
}

export interface SeriesPoint {
  key: string
  label: string
  value: number
}

/** One point per day for the last `days` days. Check habits plot 1 or 0. */
export function valueSeries(habit: Habit, days = 30, now: Date = new Date()): SeriesPoint[] {
  return recentDays(days, now).map((day) => {
    const entry = entryFor(habit, day.key)
    const value = !entry ? 0 : isMeasured(habit) ? Number(entry.value ?? 0) : 1
    return { key: day.key, label: formatShortDate(day.key), value }
  })
}
