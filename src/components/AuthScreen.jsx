import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { describeError } from '../lib/supabaseClient'

const MIN_PASSWORD_LENGTH = 6

/**
 * Combined register / log in screen. Registration and login share the same
 * fields, so one form with a mode toggle is simpler than two near-identical
 * components.
 */
export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ error: null, notice: null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegistering = mode === 'register'

  function switchMode() {
    setMode(isRegistering ? 'login' : 'register')
    setStatus({ error: null, notice: null })
  }

  function validate() {
    if (!email.includes('@')) return 'Enter a valid email address.'
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
    }
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setStatus({ error: validationError, notice: null })
      return
    }

    setIsSubmitting(true)
    setStatus({ error: null, notice: null })

    const action = isRegistering ? signUp : signIn
    const { data, error } = await action(email.trim(), password)

    if (error) {
      setStatus({ error: describeError(error), notice: null })
      setIsSubmitting(false)
      return
    }

    // With "Confirm email" turned on, signUp returns a user but no session.
    if (isRegistering && !data.session) {
      setStatus({
        error: null,
        notice: 'Account created. Check your inbox to confirm the address, then log in.',
      })
      setIsSubmitting(false)
      return
    }

    // On success the AuthProvider swaps this screen out for the dashboard.
    setIsSubmitting(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="#04231a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Streakly</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isRegistering
              ? 'Create an account to start tracking habits.'
              : 'Log in to pick up your streaks.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl"
        >
          <label className="block text-sm font-medium text-slate-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />

          <label className="block text-sm font-medium text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />

          {status.error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {status.error}
            </p>
          )}
          {status.notice && (
            <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {status.notice}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Working...' : isRegistering ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          {isRegistering ? 'Already have an account?' : 'No account yet?'}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-emerald-400 underline-offset-2 hover:underline"
          >
            {isRegistering ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>
    </main>
  )
}
