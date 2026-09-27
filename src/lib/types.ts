/**
 * Row shapes as they come back from Supabase. Keeping them in one file means
 * the query strings in api.ts and the components that render them cannot
 * quietly disagree about a field name.
 */

export type HabitKind = 'check' | 'measure'
export type GoalKind = 'total_days' | 'total_amount' | 'streak'
export type ThemePreference = 'system' | 'light' | 'dark'

export interface CheckIn {
  id: string
  /** Local calendar day, YYYY-MM-DD. */
  day: string
  /** Amount logged for a measured habit. Null for a plain check-off. */
  value?: number | null
  note?: string
}

export interface Habit {
  id: string
  name: string
  description?: string
  color?: string
  target_per_week: number
  created_at: string
  /** Older rows and test fixtures may omit these; they default to a check habit. */
  kind?: HabitKind
  unit?: string
  daily_target?: number | null
  icon?: string
  check_ins: CheckIn[]
}

export interface Goal {
  id: string
  habit_id: string
  title: string
  kind: GoalKind
  target: number
  /** YYYY-MM-DD, or null for an open-ended goal. */
  deadline: string | null
  created_at: string
}

export interface Profile {
  id: string
  display_name: string
  theme: ThemePreference
  /** 0 = Sunday, 1 = Monday. */
  week_start: 0 | 1
}

/** What the habit form hands to the data layer. */
export interface HabitInput {
  name: string
  description: string
  color: string
  icon: string
  kind: HabitKind
  unit: string
  dailyTarget: number | null
  targetPerWeek: number
}

export interface GoalInput {
  habitId: string
  title: string
  kind: GoalKind
  target: number
  deadline: string | null
}
