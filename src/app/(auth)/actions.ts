'use server'

/**
 * Auth runs as Server Actions: the form posts to the server, Supabase sets the
 * session cookie on the response, and the next page render already knows who
 * the user is. No token ever sits in localStorage.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from '@/lib/auth-rules'
import { describeError } from '@/lib/errors'
import { getServerClient } from '@/lib/supabase/server'

export interface AuthState {
  error: string | null
  message: string | null
  /** Echoed back so the form can refill after React resets it on submit. */
  fields?: { email?: string; displayName?: string }
}

/** Only same-site relative paths, so ?next= cannot bounce a user to another domain. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/today'
}

async function origin(): Promise<string> {
  const headerList = await headers()
  const forwardedHost = headerList.get('x-forwarded-host')
  const host = forwardedHost ?? headerList.get('host') ?? 'localhost:3000'
  const protocol = headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

const fail = (error: string, fields?: AuthState['fields']): AuthState => ({ error, message: null, fields })

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, 'email').toLowerCase()
  const password = formData.get('password')
  const fields = { email }
  if (!EMAIL_PATTERN.test(email)) return fail('Enter a valid email address.', fields)
  if (typeof password !== 'string' || password.length === 0) return fail('Enter your password.', fields)

  const supabase = await getServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return fail(describeError(error) ?? 'Could not sign in.', fields)

  redirect(safeNext(formData.get('next')))
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const displayName = field(formData, 'displayName').slice(0, 40)
  const email = field(formData, 'email').toLowerCase()
  const password = formData.get('password')
  const fields = { email, displayName }
  if (!displayName) return fail('Tell us what to call you.', fields)
  if (!EMAIL_PATTERN.test(email)) return fail('Enter a valid email address.', fields)
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`, fields)
  }

  const supabase = await getServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${await origin()}/auth/callback?next=/today`,
    },
  })
  if (error) return fail(describeError(error) ?? 'Could not create your account.', fields)

  // With email confirmation on, Supabase returns a user but no session.
  if (!data.session) {
    return { error: null, message: `Check ${email} for a confirmation link to finish signing up.` }
  }
  redirect('/today?welcome=1')
}

export async function signOut(): Promise<void> {
  const supabase = await getServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, 'email').toLowerCase()
  if (!EMAIL_PATTERN.test(email)) return fail('Enter a valid email address.')

  const supabase = await getServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  })
  if (error) return fail(describeError(error) ?? 'Could not send the reset email.')

  // Same message whether or not the account exists, so the form cannot be
  // used to find out who has an account.
  return { error: null, message: `If ${email} has an account, a reset link is on its way.` }
}

export async function resetPassword(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password')
  const confirm = formData.get('confirm')
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`)
  }
  if (password !== confirm) return fail('The two passwords do not match.')

  const supabase = await getServerClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return fail('This reset link has expired. Request a new one.')

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return fail(describeError(error) ?? 'Could not update your password.')

  redirect('/today?reset=1')
}
