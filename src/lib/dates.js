/**
 * Date helpers for the daily view and the check-in history.
 *
 * Everything works in the browser's local timezone. Using toISOString() here
 * would be a bug: late in the evening it rolls over to the next UTC day and a
 * user would check off tomorrow's box.
 */

const WEEKDAY_NARROW = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' })
const LONG_DATE = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})
const SHORT_DATE = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const DAY_MS = 24 * 60 * 60 * 1000

/** Formats a Date as the YYYY-MM-DD string stored in check_ins.day. */
export function toDayKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey() {
  return toDayKey(new Date())
}

/** Parses YYYY-MM-DD into a LOCAL date. new Date(key) would parse it as UTC. */
function parseDayKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function shiftDays(date, offset) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + offset)
  return copy
}

export function formatLongDate(date = new Date()) {
  return LONG_DATE.format(date)
}

export function formatShortDate(date = new Date()) {
  return SHORT_DATE.format(date)
}

/** The last `count` days, oldest first, ready to render as a row of boxes. */
export function recentDays(count = 7) {
  const today = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = shiftDays(today, index - (count - 1))
    return {
      key: toDayKey(date),
      weekday: WEEKDAY_NARROW.format(date),
      dayOfMonth: date.getDate(),
      isToday: index === count - 1,
    }
  })
}

/**
 * Length of the current run of consecutive completed days.
 *
 * A streak survives an incomplete today (the day is not over yet) but breaks
 * as soon as a full day is missed.
 */
export function calculateStreak(completedDayKeys) {
  const completed = new Set(completedDayKeys)
  if (completed.size === 0) return 0

  const today = new Date()
  let cursor = completed.has(toDayKey(today)) ? today : shiftDays(today, -1)
  let streak = 0

  while (completed.has(toDayKey(cursor))) {
    streak += 1
    cursor = shiftDays(cursor, -1)
  }

  return streak
}

/**
 * Longest run of consecutive days ever recorded.
 *
 * Every check-in already arrives with its habit, so this needs no extra query:
 * sort the days and walk them once.
 */
export function calculateBestStreak(completedDayKeys) {
  const sorted = [...new Set(completedDayKeys)].sort()
  if (sorted.length === 0) return 0

  let best = 1
  let run = 1

  for (let index = 1; index < sorted.length; index += 1) {
    // Round the gap: a DST boundary makes it 23 or 25 hours, not exactly 24.
    const gap = Math.round(
      (parseDayKey(sorted[index]) - parseDayKey(sorted[index - 1])) / DAY_MS,
    )
    run = gap === 1 ? run + 1 : 1
    if (run > best) best = run
  }

  return best
}

/** How many of the last 7 days were completed, for the weekly target. */
export function countThisWeek(completedDayKeys) {
  const week = new Set(recentDays(7).map((day) => day.key))
  return completedDayKeys.filter((key) => week.has(key)).length
}

export function isCompletedToday(completedDayKeys) {
  return completedDayKeys.includes(todayKey())
}
