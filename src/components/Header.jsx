import { useAuth } from '../hooks/useAuth'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-slate-800 bg-slate-900/40">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="#04231a"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight text-white">Streakly</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
