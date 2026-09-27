import { DatabaseZap, KeyRound } from 'lucide-react'
import { Logo } from '@/components/ui/misc'

interface SetupNoticeProps {
  kind: 'env' | 'migration'
  detail?: string
}

/** Shown instead of crashing when the deploy is missing config or the v2 tables. */
export function SetupNotice({ kind, detail }: SetupNoticeProps) {
  const isEnv = kind === 'env'
  return (
    <main className="bg-aurora grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-8 shadow-card">
        <Logo />
        <div className="mt-8 grid size-12 place-items-center rounded-2xl bg-warning/15 text-warning">
          {isEnv ? <KeyRound className="size-6" /> : <DatabaseZap className="size-6" />}
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          {isEnv ? 'Supabase is not configured' : 'One database step left'}
        </h1>
        {isEnv ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Set <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then rebuild. On Netlify
            they must be set before the build runs, because Next.js inlines them.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Open the Supabase dashboard, go to <strong className="text-foreground">SQL Editor</strong>, paste{' '}
              <code className="break-all text-foreground">supabase/migrations/002_v2_goals_measurements_profiles.sql</code>,
              and run it. It only adds tables and columns; existing habits are untouched.
            </p>
            {detail && (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-surface-2 p-3 text-xs text-muted">{detail}</pre>
            )}
          </>
        )}
      </div>
    </main>
  )
}
