/**
 * Shown when the app was built without Supabase credentials. Failing with
 * instructions is far more useful than letting every query throw.
 */
export function SetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h1 className="text-lg font-semibold text-amber-200">Supabase is not configured</h1>
        <p className="mt-2 text-sm text-slate-300">
          Copy <code className="rounded bg-slate-800 px-1.5 py-0.5">.env.example</code> to{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5">.env</code>, then fill in these two
          values from your Supabase project settings and restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
        </pre>
        <p className="mt-4 text-sm text-slate-400">
          On Netlify, add the same two variables under Site configuration &rarr; Environment
          variables and redeploy.
        </p>
      </div>
    </main>
  )
}
