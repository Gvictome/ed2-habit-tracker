import { describe, expect, test } from 'vitest'
import { heatmap, valueSeries } from './stats'
import { NOW, dayOffset, makeHabit } from './test-fixtures'

describe('heatmap', () => {
  test('lays out whole weeks, each column starting on the chosen week start', () => {
    const weeks = heatmap([makeHabit()], 4, 1, NOW)
    expect(weeks).toHaveLength(4)
    for (const week of weeks) expect(week).toHaveLength(7)
    // NOW is a Friday; with Monday starts the last column begins on Monday the 21st.
    expect(weeks[3][0].key).toBe(dayOffset(-4))
  })

  test('marks future days in the current week so they can render empty', () => {
    const weeks = heatmap([makeHabit()], 1, 1, NOW)
    expect(weeks[0][4].isFuture).toBe(false) // Friday = today
    expect(weeks[0][5].isFuture).toBe(true)
  })

  test('scores a day by the share of existing habits completed', () => {
    const a = makeHabit({ name: 'A', offsets: [0] })
    const b = makeHabit({ name: 'B', offsets: [] })
    const today = heatmap([a, b], 1, 1, NOW)[0][4]
    expect(today.ratio).toBe(0.5)
    expect(today.done).toBe(1)
  })

  test('does not count a habit on days before it was created', () => {
    const old = makeHabit({ name: 'Old', offsets: [-2] })
    const fresh = makeHabit({ name: 'New', createdOffset: 0 })
    const wednesday = heatmap([old, fresh], 1, 1, NOW)[0][2]
    expect(wednesday.ratio).toBe(1)
  })
})

describe('valueSeries', () => {
  test('returns one point per day, oldest first, with 0 for empty days', () => {
    const habit = makeHabit({ kind: 'measure', dailyTarget: 8, offsets: [0, -2], values: [6, 9] })
    const series = valueSeries(habit, 3, NOW)
    expect(series.map((point) => point.value)).toEqual([9, 0, 6])
    expect(series[2].key).toBe(dayOffset(0))
  })

  test('uses 1 and 0 for a check habit', () => {
    const habit = makeHabit({ offsets: [0] })
    expect(valueSeries(habit, 2, NOW).map((point) => point.value)).toEqual([0, 1])
  })
})
