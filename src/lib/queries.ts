/**
 * Column lists shared by the server layout (first render) and the browser
 * data layer (every update after), so both always select the same shape.
 */
export const HABIT_COLUMNS =
  'id, name, description, color, target_per_week, created_at, kind, unit, daily_target, icon, check_ins (id, day, value, note)'
export const GOAL_COLUMNS = 'id, habit_id, title, kind, target, deadline, created_at'
export const ENTRY_COLUMNS = 'id, day, value, note'
export const PROFILE_COLUMNS = 'id, display_name, theme, week_start'
