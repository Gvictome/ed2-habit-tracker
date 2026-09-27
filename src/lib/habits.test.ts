import { describe, expect, test } from 'vitest'
import {
  completedDays,
  dayProgress,
  entryFor,
  habitStats,
  isEntryDone,
  totalAmount,
} from './habits'
import { NOW, dayOffset, makeHabit } from './test-fixtures'

describe('isEntryDone', () => {
  test('any check-in completes a check habit', () => {
    const habit = makeHabit({ offsets: [0] })
    expect(isEntryDone(habit, habit.check_ins[0])).toBe(true)
  })

  test('a habit with no kind is treated as a check habit, so v1 rows keep working', () => {
    const habit = { ...makeHabit({ offsets: [0] }), kind: undefined }
    expect(isEntryDone(habit, habit.check_ins[0])).toBe(true)
  })

  test('a measured day is done only once the value reaches the daily target', () => {
    const habit = makeHabit({ kind: 'measure', dailyTarget: 8, offsets: [0, -1, -2], values: [8, 5, 12] })
    expect(habit.check_ins.map((entry) => isEntryDone(habit, entry))).toEqual([true, false, true])
  })
})

describe('completedDays', () => {
  test('drops measured days that fell short of the target', () => {
    const habit = makeHabit({ kind: 'measure', dailyTarget: 30, offsets: [0, -1], values: [10, 45] })
    expect(completedDays(habit)).toEqual([dayOffset(-1)])
  })
})

describe('dayProgress', () => {
  test('returns a partial ratio for a measured day, capped at 1', () => {
    const habit = makeHabit({ kind: 'measure', dailyTarget: 8, offsets: [0, -1], values: [4, 20] })
    expect(dayProgress(habit, dayOffset(0))).toBe(0.5)
    expect(dayProgress(habit, dayOffset(-1))).toBe(1)
  })

  test('is 0 for a day with no entry and 1 for a checked day', () => {
    const habit = makeHabit({ offsets: [0] })
    expect(dayProgress(habit, dayOffset(0))).toBe(1)
    expect(dayProgress(habit, dayOffset(-3))).toBe(0)
  })
})

describe('entryFor and totalAmount', () => {
  test('finds the entry for a day', () => {
    const habit = makeHabit({ offsets: [0, -2] })
    expect(entryFor(habit, dayOffset(-2))?.day).toBe(dayOffset(-2))
    expect(entryFor(habit, dayOffset(-1))).toBeUndefined()
  })

  test('sums every logged amount, whether or not the day hit its target', () => {
    const habit = makeHabit({ kind: 'measure', dailyTarget: 5, offsets: [0, -1, -2], values: [2, 5, 7.5] })
    expect(totalAmount(habit)).toBe(14.5)
  })
})

describe('habitStats', () => {
  test('summarises streaks, totals, and the 30-day completion rate', () => {
    // Done every day for the last 10 days, target 7 a week.
    const habit = makeHabit({ offsets: Array.from({ length: 10 }, (_, i) => -i) })
    const stats = habitStats(habit, NOW)
    expect(stats.streak).toBe(10)
    expect(stats.bestStreak).toBe(10)
    expect(stats.totalDays).toBe(10)
    expect(stats.isDoneToday).toBe(true)
    expect(stats.thisWeek).toBe(7)
    // 10 of 30 expected days.
    expect(stats.completionRate).toBeCloseTo(10 / 30, 5)
  })

  test('scales the completion rate to a habit\'s weekly target and caps it at 100%', () => {
    const habit = makeHabit({ target: 1, offsets: Array.from({ length: 30 }, (_, i) => -i) })
    expect(habitStats(habit, NOW).completionRate).toBe(1)
  })

  test('only counts days since the habit was created toward the completion rate', () => {
    // Created 4 days ago and done on all 5 days since (today included).
    const habit = makeHabit({ createdOffset: -4, offsets: [0, -1, -2, -3, -4] })
    expect(habitStats(habit, NOW).completionRate).toBe(1)
  })
})
