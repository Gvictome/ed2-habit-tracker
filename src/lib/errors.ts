/**
 * Supabase returns errors as values rather than throwing. This turns one into
 * a message a user can actually act on.
 */
export function describeError(
  error: { message?: string } | string | null | undefined,
  fallback = 'Something went wrong. Please try again.',
): string | null {
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
    return 'Password must be at least 8 characters long.'
  }
  if (message.includes('should be different')) {
    return 'Pick a password you have not used on this account before.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirm your email first - check your inbox for the link.'
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Could not reach the server. Check your connection and try again.'
  }
  if (message.includes('does not exist') || message.includes('schema cache')) {
    return 'The database is missing the v2 tables. Run supabase/migrations/002 in the SQL editor.'
  }
  return message
}
