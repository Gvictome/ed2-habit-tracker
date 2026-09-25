import { describe, expect, test } from 'vitest'
import { goalProgress } from './goals'
import { NOW, dayOffset, makeGoal, makeHabit } from './test-fixtures'

// The default goal was set on 15 September, ten days before NOW.

describe('goalProgress: total_days', () => {
  test('counts only completed days on or after the day the goal was set', () => {
    // -12 is before the goal existed, so it does not count.
    const habit = makeHabit({ offsets: [0, -1, -2, -12] })
    const progress = goalProgress(makeGoal({ target: 10 }), habit, NOW)
    expect(progress.current).toBe(3)
    expect(progress.ratio).toBeCloseTo(0.3, 5)
    expect(progress.isComplete).toBe(false)
    expect(progress.remaining).toBe(7)
  })

  test('is complete once the target is reached, and the ratio caps at 1', () => {
    const habit = makeHabit({ offsets: Array.from({ length: 11 }, (_, i) => -i) })
    const progress = goalProgress(makeGoal({ target: 5 }), habit, NOW)
    expect(progress.isComplete).toBe(true)
    expect(progress.ratio).toBe(1)
    expect(progress.status).toBe('complete')
    expect(progress.remaining).toBe(0)
  })
})

describe('goalProgress: total_amount', () => {
  test('sums logged amounts since the goal was set, including short days', () => {
    const habit = makeHabit({
      kind: 'measure',
      dailyTarget: 5,
      offsets: [0, -1, -20],
      values: [3, 6, 100],
    })
    const progress = goalProgress(makeGoal({ kind: 'total_amount', target: 50 }), habit, NOW)
    expect(progress.current).toBe(9)
  })
})

describe('goalProgress: streak', () => {
  test('tracks the live streak and completes when any run since the start reaches the target', () => {
    const habit = makeHabit({ offsets: [0, -1, -2] })
    const live = goalProgress(makeGoal({ kind: 'streak', target: 7 }), habit, NOW)
    expect(live.current).toBe(3)
    expect(live.isComplete).toBe(false)

    // A 7-day run earlier since the goal was set, then a break: still complete.
    const earlier = makeHabit({ offsets: [-9, -8, -7, -6, -5, -4, -3] })
    const done = goalProgress(makeGoal({ kind: 'streak', target: 7 }), earlier, NOW)
    expect(done.isComplete).toBe(true)
  })

  test('projects a streak goal as the remaining days in a row from today', () => {
    const habit = makeHabit({ offsets: [0, -1, -2] })
    const progress = goalProgress(makeGoal({ kind: 'streak', target: 7 }), habit, NOW)
    expect(progress.projectedDate).toBe(dayOffset(4))
  })
})

describe('goalProgress: pace and deadlines', () => {
  test('projects the finish date from the pace since the goal was set', () => {
    // 5 done days across the 11 days since the start (15th..25th) -> 5/11 per day.
    const habit = makeHabit({ offsets: [0, -2, -4, -6, -8] })
    const progress = goalProgress(makeGoal({ target: 10 }), habit, NOW)
    // 5 remaining at 5/11 a day = 11 more days.
    expect(progress.projectedDate).toBe(dayOffset(11))
    expect(progress.status).toBe('no_deadline')
  })

  test('is on track when the projection lands on or before the deadline', () => {
    const habit = makeHabit({ offsets: [0, -2, -4, -6, -8] })
    const progress = goalProgress(makeGoal({ target: 10, deadline: dayOffset(20) }), habit, NOW)
    expect(progress.status).toBe('on_track')
    expect(progress.daysLeft).toBe(20)
  })

  test('is behind when the projection lands after the deadline', () => {
    const habit = makeHabit({ offsets: [0, -2, -4, -6, -8] })
    const progress = goalProgress(makeGoal({ target: 10, deadline: dayOffset(5) }), habit, NOW)
    expect(progress.status).toBe('behind')
  })

  test('is overdue once the deadline has passed without finishing', () => {
    const habit = makeHabit({ offsets: [0] })
    const progress = goalProgress(makeGoal({ target: 10, deadline: dayOffset(-1) }), habit, NOW)
    expect(progress.status).toBe('overdue')
    expect(progress.daysLeft).toBe(-1)
  })

  test('has no projection when nothing has been logged yet', () => {
    const progress = goalProgress(makeGoal({ target: 10 }), makeHabit(), NOW)
    expect(progress.current).toBe(0)
    expect(progress.projectedDate).toBeNull()
  })
})
