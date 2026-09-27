'use client'

import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  requestPasswordReset,
  resetPassword,
  signIn,
  signUp,
  type AuthState,
} from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth-rules'

const INITIAL: AuthState = { error: null, message: null }

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" isLoading={pending} className="mt-2 w-full">
      {children}
    </Button>
  )
}

function Alert({ state }: { state: AuthState }) {
  if (!state.error && !state.message) return null
  const isError = Boolean(state.error)
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={
        isError
          ? 'flex gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger'
          : 'flex gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success'
      }
    >
      {isError ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
      <span>{state.error ?? state.message}</span>
    </div>
  )
}

function PasswordInput({ id, name, autoComplete, describedBy }: { id: string; name: string; autoComplete: string; describedBy?: string }) {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        className="pr-11"
        aria-describedby={describedBy}
      />
      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-foreground"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
    </div>
  )
}

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, action] = useActionState(signIn, linkError ? { error: 'That link is invalid or has expired. Try again.', message: null } : INITIAL)
  return (
    <>
      <Heading
        title="Welcome back"
        subtitle={
          <>
            New here?{' '}
            <Link href="/signup" className="font-semibold text-accent-text hover:underline">
              Create an account
            </Link>
          </>
        }
      />
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next ?? '/today'} />
        <Alert state={state} />
        <Field label="Email">
          {(id) => (
            <Input id={id} name="email" type="email" autoComplete="email" required placeholder="you@example.com" defaultValue={state.fields?.email} key={state.fields?.email} />
          )}
        </Field>
        <Field
          label="Password"
          hint={
            <Link href="/forgot-password" className="font-semibold hover:text-foreground">
              Forgot password?
            </Link>
          }
        >
          {(id, describedBy) => <PasswordInput id={id} name="password" autoComplete="current-password" describedBy={describedBy} />}
        </Field>
        <Submit>Log in</Submit>
      </form>
    </>
  )
}

export function SignupForm() {
  const [state, action] = useActionState(signUp, INITIAL)
  return (
    <>
      <Heading
        title="Create your account"
        subtitle={
          <>
            Already have one?{' '}
            <Link href="/login" className="font-semibold text-accent-text hover:underline">
              Log in
            </Link>
          </>
        }
      />
      <form action={action} className="flex flex-col gap-4">
        <Alert state={state} />
        <Field label="Your name">
          {(id) => (
            <Input id={id} name="displayName" autoComplete="given-name" required maxLength={40} placeholder="Alex" defaultValue={state.fields?.displayName} key={state.fields?.displayName} />
          )}
        </Field>
        <Field label="Email">
          {(id) => (
            <Input id={id} name="email" type="email" autoComplete="email" required placeholder="you@example.com" defaultValue={state.fields?.email} key={state.fields?.email} />
          )}
        </Field>
        <Field label="Password" hint={`At least ${MIN_PASSWORD_LENGTH} characters`}>
          {(id, describedBy) => <PasswordInput id={id} name="password" autoComplete="new-password" describedBy={describedBy} />}
        </Field>
        <Submit>Create account</Submit>
        <p className="text-center text-xs text-faint">Free. Your habits are visible only to you.</p>
      </form>
    </>
  )
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, INITIAL)
  return (
    <>
      <Heading title="Reset your password" subtitle="We will email you a link to choose a new one." />
      <form action={action} className="flex flex-col gap-4">
        <Alert state={state} />
        <Field label="Email">
          {(id) => <Input id={id} name="email" type="email" autoComplete="email" required placeholder="you@example.com" />}
        </Field>
        <Submit>Send reset link</Submit>
        <Link href="/login" className="text-center text-sm font-semibold text-muted hover:text-foreground">
          Back to log in
        </Link>
      </form>
    </>
  )
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, INITIAL)
  return (
    <>
      <Heading title="Choose a new password" subtitle="You will be signed in straight after." />
      <form action={action} className="flex flex-col gap-4">
        <Alert state={state} />
        <Field label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters`}>
          {(id, describedBy) => <PasswordInput id={id} name="password" autoComplete="new-password" describedBy={describedBy} />}
        </Field>
        <Field label="Confirm new password">
          {(id) => <PasswordInput id={id} name="confirm" autoComplete="new-password" />}
        </Field>
        <Submit>Update password</Submit>
      </form>
    </>
  )
}
