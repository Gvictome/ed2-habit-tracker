/**
 * Date helpers for the daily view and the check-in history.
 *
 * Everything works in the browser's local timezone. Using toISOString() here
 * would be a bug: late in the evening it rolls over to the next UTC day and a
 * user would check off tomorrow's box.
 *
 * Functions that depend on "today" take an optional `now` so tests can pin it.
 */

const WEEKDAY_NARROW = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' })
const WEEKDAY_SHORT = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const LONG_DATE = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const SHORT_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const MEDIUM_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const DAY_MS = 24 * 60 * 60 * 1000

export interface DayCell {
  key: string
  weekday: string
  weekdayShort: string
  dayOfMonth: number
  isToday: boolean
}

/** Formats a Date as the YYYY-MM-DD string stored in check_ins.day. */
export function toDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(now: Date = new Date()): string {
  return toDayKey(now)
}

/** Parses YYYY-MM-DD into a LOCAL date. new Date(key) would parse it as UTC. */
export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function shiftDays(date: Date, offset: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + offset)
  return copy
}

export function addDaysToKey(key: string, offset: number): string {
  return toDayKey(shiftDays(parseDayKey(key), offset))
}

/** Whole days from `fromKey` to `toKey`. Rounded so a DST boundary (23h/25h) still counts as one. */
export function daysBetweenKeys(fromKey: string, toKey: string): number {
  return Math.round((parseDayKey(toKey).getTime() - parseDayKey(fromKey).getTime()) / DAY_MS)
}

export function formatLongDate(date: Date = new Date()): string {
  return LONG_DATE.format(date)
}

export function formatShortDate(dateOrKey: Date | string): string {
  return SHORT_DATE.format(typeof dateOrKey === 'string' ? parseDayKey(dateOrKey) : dateOrKey)
}

export function formatMediumDate(dateOrKey: Date | string): string {
  return MEDIUM_DATE.format(typeof dateOrKey === 'string' ? parseDayKey(dateOrKey) : dateOrKey)
}

/** The last `count` days, oldest first, ready to render as a row of boxes. */
export function recentDays(count = 7, now: Date = new Date()): DayCell[] {
  return Array.from({ length: count }, (_, index) => {
    const date = shiftDays(now, index - (count - 1))
    return {
      key: toDayKey(date),
      weekday: WEEKDAY_NARROW.format(date),
      weekdayShort: WEEKDAY_SHORT.format(date),
      dayOfMonth: date.getDate(),
      isToday: index === count - 1,
    }
  })
}

/** The first day of the week containing `date`. weekStart: 0 = Sunday, 1 = Monday. */
export function startOfWeek(date: Date, weekStart: 0 | 1 = 1): Date {
  const offset = (date.getDay() - weekStart + 7) % 7
  return shiftDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), -offset)
}

/**
 * Length of the current run of consecutive completed days.
 *
 * A streak survives an incomplete today (the day is not over yet) but breaks
 * as soon as a full day is missed.
 */
export function calculateStreak(completedDayKeys: string[], now: Date = new Date()): number {
  const completed = new Set(completedDayKeys)
  if (completed.size === 0) return 0

  let cursor = completed.has(toDayKey(now)) ? now : shiftDays(now, -1)
  let streak = 0

  while (completed.has(toDayKey(cursor))) {
    streak += 1
    cursor = shiftDays(cursor, -1)
  }

  return streak
}

/** Longest run of consecutive days ever recorded: sort the days and walk them once. */
export function calculateBestStreak(completedDayKeys: string[]): number {
  const sorted = [...new Set(completedDayKeys)].sort()
  if (sorted.length === 0) return 0

  let best = 1
  let run = 1

  for (let index = 1; index < sorted.length; index += 1) {
    run = daysBetweenKeys(sorted[index - 1], sorted[index]) === 1 ? run + 1 : 1
    if (run > best) best = run
  }

  return best
}

/** How many of the last 7 days were completed, for the weekly target. */
export function countThisWeek(completedDayKeys: string[], now: Date = new Date()): number {
  const week = new Set(recentDays(7, now).map((day) => day.key))
  return completedDayKeys.filter((key) => week.has(key)).length
}

export function isCompletedToday(completedDayKeys: string[], now: Date = new Date()): boolean {
  return completedDayKeys.includes(todayKey(now))
}
