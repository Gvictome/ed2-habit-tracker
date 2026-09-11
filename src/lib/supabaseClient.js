import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * False when the app was built without Supabase credentials. The UI shows a
 * setup screen in that case instead of crashing on the first query.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Supabase returns errors as values rather than throwing. This turns one into
 * a message a user can actually act on.
 */
export function describeError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return null
  const message = typeof error === 'string' ? error : error.message
  if (!message) return fallback
  if (message.includes('Invalid login credentials')) {
    return 'That email and password combination did not match an account.'
  }
  if (message.includes('already registered')) {
    return 'An account with that email already exists. Try logging in instead.'
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.'
  }
  return message
}
