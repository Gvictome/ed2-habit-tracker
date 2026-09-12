import { describe, expect, test } from 'vitest'
import {
  calculateProgress,
  coldThresholdDays,
  daysSinceActivity,
  isCold,
  levelFromXp,
  titleForLevel,
  xpForLevel,
} from './levels'
import { toDayKey } from './dates'

const NOW = new Date(2026, 8, 12) // 12 September 2026, local time.

function dayOffset(offset) {
  const date = new Date(NOW)
  date.setDate(date.getDate() + offset)
  return toDayKey(date)
}

/** A habit whose check-ins are the given day offsets from NOW (0 = today). */
function habit({ name = 'Test', target = 7, offsets = [], createdOffset = -30 } = {}) {
  const created = new Date(NOW)
  created.setDate(created.getDate() + createdOffset)
  return {
    id: name,
    name,
    target_per_week: target,
    created_at: created.toISOString(),
    check_ins: offsets.map((offset) => ({ id: `${name}-${offset}`, day: dayOffset(offset) })),
  }
}

describe('xpForLevel', () => {
  test('level 1 starts at zero so a new user is level 1, not level 0', () => {
    expect(xpForLevel(1)).toBe(0)
  })

  test('each level costs 100 XP more than the one before', () => {
    expect(xpForLevel(2)).toBe(100)
    expect(xpForLevel(3)).toBe(300)
    expect(xpForLevel(4)).toBe(600)
    expect(xpForLevel(5)).toBe(1000)
  })
})

describe('levelFromXp', () => {
  test('returns level 1 for no XP', () => {
    expect(levelFromXp(0)).toBe(1)
  })

  test('promotes exactly on the threshold, not one XP later', () => {
    expect(levelFromXp(99)).toBe(1)
    expect(levelFromXp(100)).toBe(2)
    expect(levelFromXp(299)).toBe(2)
    expect(levelFromXp(300)).toBe(3)
  })

  test('is the inverse of xpForLevel across a wide range', () => {
    for (let level = 1; level <= 25; level += 1) {
      expect(levelFromXp(xpForLevel(level))).toBe(level)
    }
  })
})

describe('titleForLevel', () => {
  test('names the tier a level falls in', () => {
    expect(titleForLevel(1)).toBe('Getting started')
    expect(titleForLevel(5)).toBe('Consistent')
    expect(titleForLevel(20)).toBe('Unstoppable')
  })
})

describe('coldThresholdDays', () => {
  test('a daily habit goes cold fastest', () => {
    expect(coldThresholdDays(7)).toBe(3)
  })

  test('a habit with a lower target gets proportionally more room', () => {
    expect(coldThresholdDays(3)).toBe(5)
    expect(coldThresholdDays(1)).toBe(9)
  })
})

describe('daysSinceActivity', () => {
  test('counts from the most recent check-in, not the first', () => {
    expect(daysSinceActivity(habit({ offsets: [-9, -2] }), NOW)).toBe(2)
  })

  test('falls back to the creation date when nothing is checked off', () => {
    expect(daysSinceActivity(habit({ offsets: [], createdOffset: -4 }), NOW)).toBe(4)
  })
})

describe('isCold', () => {
  test('a habit checked off today is warm', () => {
    expect(isCold(habit({ offsets: [0] }), NOW)).toBe(false)
  })

  test('a brand-new habit is not born cold', () => {
    expect(isCold(habit({ offsets: [], createdOffset: 0 }), NOW)).toBe(false)
  })

  test('a daily habit quiet for three days is cold', () => {
    expect(isCold(habit({ target: 7, offsets: [-3] }), NOW)).toBe(true)
    expect(isCold(habit({ target: 7, offsets: [-2] }), NOW)).toBe(false)
  })

  test('a three-a-week habit is not punished for its scheduled days off', () => {
    expect(isCold(habit({ target: 3, offsets: [-3] }), NOW)).toBe(false)
    expect(isCold(habit({ target: 3, offsets: [-5] }), NOW)).toBe(true)
  })
})

describe('calculateProgress', () => {
  test('no habits means level 1 and no cooling-off warning', () => {
    const progress = calculateProgress([], NOW)
    expect(progress.xp).toBe(0)
    expect(progress.level).toBe(1)
    expect(progress.isCoolingOff).toBe(false)
  })

  test('consistency raises XP: every check-in and every live streak day counts', () => {
    // Four consecutive days ending today: 4 check-ins (40) + 4 streak days (20).
    const progress = calculateProgress([habit({ offsets: [-3, -2, -1, 0] })], NOW)
    expect(progress.totalCheckIns).toBe(4)
    expect(progress.streakDays).toBe(4)
    expect(progress.xp).toBe(60)
  })

  test('a cold habit costs XP', () => {
    const warm = calculateProgress([habit({ name: 'A', offsets: [-1, 0] })], NOW)
    const cold = calculateProgress([habit({ name: 'A', offsets: [-8, -7] })], NOW)
    expect(cold.xp).toBeLessThan(warm.xp)
    expect(cold.coldCount).toBe(1)
  })

  test('a minority of cold habits does not trigger the multiplier', () => {
    const progress = calculateProgress(
      [
        habit({ name: 'A', offsets: [-1, 0] }),
        habit({ name: 'B', offsets: [-1, 0] }),
        habit({ name: 'C', offsets: [-9] }),
      ],
      NOW,
    )
    expect(progress.coldCount).toBe(1)
    expect(progress.isCoolingOff).toBe(false)
  })

  test('a majority of cold habits triggers the cooling-off cut', () => {
    const progress = calculateProgress(
      [
        habit({ name: 'A', offsets: [-9] }),
        habit({ name: 'B', offsets: [-9] }),
        habit({ name: 'C', offsets: [-1, 0] }),
      ],
      NOW,
    )
    expect(progress.coldCount).toBe(2)
    expect(progress.isCoolingOff).toBe(true)
    expect(progress.coldNames).toEqual(['A', 'B'])
  })

  test('exactly half cold is not a majority', () => {
    const progress = calculateProgress(
      [habit({ name: 'A', offsets: [-9] }), habit({ name: 'B', offsets: [-1, 0] })],
      NOW,
    )
    expect(progress.coldCount).toBe(1)
    expect(progress.isCoolingOff).toBe(false)
  })

  test('the level falls when habits go cold, which is the whole point', () => {
    const active = [
      habit({ name: 'A', offsets: Array.from({ length: 20 }, (_, i) => -i) }),
      habit({ name: 'B', offsets: Array.from({ length: 20 }, (_, i) => -i) }),
      habit({ name: 'C', offsets: Array.from({ length: 20 }, (_, i) => -i) }),
    ]
    // Same history, but every check-in is 30 days older: all three are cold.
    const lapsed = [
      habit({ name: 'A', offsets: Array.from({ length: 20 }, (_, i) => -i - 30) }),
      habit({ name: 'B', offsets: Array.from({ length: 20 }, (_, i) => -i - 30) }),
      habit({ name: 'C', offsets: Array.from({ length: 20 }, (_, i) => -i - 30) }),
    ]
    expect(calculateProgress(lapsed, NOW).level).toBeLessThan(
      calculateProgress(active, NOW).level,
    )
  })

  test('XP never goes negative, however bad things get', () => {
    const progress = calculateProgress(
      [habit({ name: 'A', offsets: [] }), habit({ name: 'B', offsets: [] })],
      NOW,
    )
    expect(progress.xp).toBe(0)
    expect(progress.level).toBe(1)
  })

  test('reports progress within the current level', () => {
    const progress = calculateProgress([habit({ offsets: [-3, -2, -1, 0] })], NOW)
    expect(progress.xp).toBe(60)
    expect(progress.level).toBe(1)
    expect(progress.xpIntoLevel).toBe(60)
    expect(progress.xpForNextLevel).toBe(100)
    expect(progress.xpToNextLevel).toBe(40)
    expect(progress.progressRatio).toBeCloseTo(0.6)
  })
})
