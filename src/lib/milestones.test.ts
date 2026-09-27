import { describe, expect, test } from 'vitest'
import { habitMilestones, nextMilestones, overallMilestones } from './milestones'
import { dayOffset, makeHabit } from './test-fixtures'

describe('habitMilestones', () => {
  test('marks streak milestones achieved on the day the run first reached them', () => {
    // A 7-day run ending 3 days ago.
    const habit = makeHabit({ name: 'Read', offsets: [-9, -8, -7, -6, -5, -4, -3] })
    const milestones = habitMilestones(habit)
    const three = milestones.find((m) => m.id === 'Read:streak:3')
    const seven = milestones.find((m) => m.id === 'Read:streak:7')
    const fourteen = milestones.find((m) => m.id === 'Read:streak:14')
    expect(three?.achievedOn).toBe(dayOffset(-7))
    expect(seven?.achievedOn).toBe(dayOffset(-3))
    expect(fourteen?.achievedOn).toBeNull()
    expect(fourteen?.progress).toBeCloseTo(7 / 14, 5)
  })

  test('marks total-day milestones on the day the Nth completion happened', () => {
    const habit = makeHabit({ name: 'Run', offsets: Array.from({ length: 12 }, (_, i) => -i * 2) })
    const ten = habitMilestones(habit).find((m) => m.id === 'Run:total:10')
    // Sorted oldest first, the 10th completion is offset -4.
    expect(ten?.achievedOn).toBe(dayOffset(-4))
  })

  test('ignores measured days that missed the target', () => {
    const habit = makeHabit({ name: 'Water', kind: 'measure', dailyTarget: 8, offsets: [0], values: [2] })
    const first = habitMilestones(habit).find((m) => m.id === 'Water:total:1')
    expect(first?.achievedOn).toBeNull()
  })
})

describe('overallMilestones', () => {
  test('counts completions across every habit', () => {
    const a = makeHabit({ name: 'A', offsets: Array.from({ length: 6 }, (_, i) => -i) })
    const b = makeHabit({ name: 'B', offsets: Array.from({ length: 6 }, (_, i) => -i) })
    const ten = overallMilestones([a, b]).find((m) => m.id === 'all:total:10')
    expect(ten?.achievedOn).not.toBeNull()
  })
})

describe('nextMilestones', () => {
  test('returns the closest unearned milestones first', () => {
    const habit = makeHabit({ name: 'Read', offsets: [0, -1, -2, -3, -4, -5] })
    const next = nextMilestones([habit], 2)
    expect(next).toHaveLength(2)
    expect(next[0].achievedOn).toBeNull()
    expect(next[0].progress).toBeGreaterThanOrEqual(next[1].progress)
  })
})
