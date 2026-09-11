import { supabase } from './supabaseClient'

/**
 * Every Supabase call the app makes lives here, so components never talk to
 * the database directly and the query shapes are all in one place.
 *
 * Each function returns Supabase's { data, error } shape. Row Level Security
 * already scopes reads and writes to the signed-in user; passing user_id
 * explicitly keeps the intent visible and satisfies the insert policies.
 */

/** Habits for a user, newest first, each with its check-in days attached. */
export async function fetchHabits(userId) {
  return supabase
    .from('habits')
    .select('id, name, description, color, target_per_week, created_at, check_ins (id, day)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createHabit(userId, habit) {
  return supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: habit.name.trim(),
      description: habit.description.trim(),
      color: habit.color,
      target_per_week: habit.targetPerWeek,
    })
    .select('id, name, description, color, target_per_week, created_at, check_ins (id, day)')
    .single()
}

export async function updateHabit(habitId, habit) {
  return supabase
    .from('habits')
    .update({
      name: habit.name.trim(),
      description: habit.description.trim(),
      color: habit.color,
      target_per_week: habit.targetPerWeek,
    })
    .eq('id', habitId)
    .select('id, name, description, color, target_per_week, created_at, check_ins (id, day)')
    .single()
}

/** Cascades to the habit's check-ins via the foreign key. */
export async function deleteHabit(habitId) {
  return supabase.from('habits').delete().eq('id', habitId)
}

export async function addCheckIn(userId, habitId, day) {
  return supabase
    .from('check_ins')
    .insert({ user_id: userId, habit_id: habitId, day })
    .select('id, day')
    .single()
}

export async function removeCheckIn(habitId, day) {
  return supabase.from('check_ins').delete().eq('habit_id', habitId).eq('day', day)
}
