/**
 * Date helpers for the check-in grid.
 *
 * Everything works in the browser's local timezone. Using toISOString() here
 * would be a bug: late in the evening it rolls over to the next UTC day and a
 * user would check off tomorrow's box.
 */

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' })

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

function shiftDays(date, offset) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + offset)
  return copy
}

/**
 * The last `count` days, oldest first, ready to render as a row of boxes.
 */
export function recentDays(count = 7) {
  const today = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = shiftDays(today, index - (count - 1))
    return {
      key: toDayKey(date),
      weekday: WEEKDAY_FORMATTER.format(date),
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

/** How many of the last 7 days were completed, for the weekly target. */
export function countThisWeek(completedDayKeys) {
  const week = new Set(recentDays(7).map((day) => day.key))
  return completedDayKeys.filter((key) => week.has(key)).length
}
