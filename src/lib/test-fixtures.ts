import { toDayKey } from './dates'
import type { Goal, Habit, HabitKind } from './types'

/** Every test pins "now" to this local date: 25 September 2026. */
export const NOW = new Date(2026, 8, 25)

export function dayOffset(offset: number, base: Date = NOW): string {
  const date = new Date(base)
  date.setDate(date.getDate() + offset)
  return toDayKey(date)
}

interface HabitOptions {
  name?: string
  kind?: HabitKind
  target?: number
  dailyTarget?: number | null
  unit?: string
  /** Day offsets from NOW (0 = today). For measured habits pair with `values`. */
  offsets?: number[]
  values?: number[]
  createdOffset?: number
}

export function makeHabit({
  name = 'Test',
  kind = 'check',
  target = 7,
  dailyTarget = null,
  unit = '',
  offsets = [],
  values = [],
  createdOffset = -60,
}: HabitOptions = {}): Habit {
  const created = new Date(NOW)
  created.setDate(created.getDate() + createdOffset)
  return {
    id: name,
    name,
    kind,
    unit,
    daily_target: dailyTarget,
    target_per_week: target,
    created_at: created.toISOString(),
    check_ins: offsets.map((offset, index) => ({
      id: `${name}-${offset}`,
      day: dayOffset(offset),
      value: kind === 'measure' ? (values[index] ?? 0) : null,
      note: '',
    })),
  }
}

export function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal',
    habit_id: 'Test',
    title: 'Goal',
    kind: 'total_days',
    target: 10,
    deadline: null,
    created_at: new Date(2026, 8, 15).toISOString(),
    ...overrides,
  }
}
