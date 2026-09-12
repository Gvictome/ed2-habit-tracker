import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { describeError } from '../lib/supabaseClient'
import { CheckIcon, EyeIcon, EyeOffIcon } from './Icons'

const MIN_PASSWORD_LENGTH = 6

/**
 * Combined register / log in screen. Both modes take the same two fields, so
 * one form with a segmented toggle beats two near-identical components.
 */
export function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)
  const [status, setStatus] = useState({ error: null, notice: null })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegistering = mode === 'register'

  function switchTo(nextMode) {
    setMode(nextMode)
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
    }

    // On success the AuthProvider swaps this screen out for the dashboard.
    setIsSubmitting(false)
  }

  const tab = 'grow rounded-[9px] py-2 text-[13px] transition-colors'

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3.5">
          <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500">
            <CheckIcon size={27} className="text-emerald-950" />
          </span>
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">Streakly</h1>
            <p className="text-sm text-slate-400">Do the thing. Keep the streak.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="flex gap-1 rounded-xl bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => switchTo('login')}
              aria-pressed={!isRegistering}
              className={`${tab} ${isRegistering ? 'font-medium text-slate-500 hover:text-slate-300' : 'bg-slate-800 font-semibold text-white'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchTo('register')}
              aria-pressed={isRegistering}
              className={`${tab} ${isRegistering ? 'bg-slate-800 font-semibold text-white' : 'font-medium text-slate-500 hover:text-slate-300'}`}
            >
              Register
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400" htmlFor="email">
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white transition-colors outline-none placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={isRevealed ? 'text' : 'password'}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pr-11 pl-3.5 text-sm text-white transition-colors outline-none placeholder:text-slate-600 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setIsRevealed((current) => !current)}
                aria-label={isRevealed ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition-colors hover:text-slate-300"
              >
                {isRevealed ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
              </button>
            </div>
          </div>

          {status.error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
              {status.error}
            </p>
          )}
          {status.notice && (
            <p className="rounded-xl bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-300">
              {status.notice}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 transition-transform duration-150 hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {isSubmitting ? 'Working...' : isRegistering ? 'Create account' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  )
}
