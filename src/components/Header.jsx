import { useAuth } from '../hooks/useAuth'
import { CheckIcon } from './Icons'
import { LevelBadge } from './LevelBadge'

export function Header({ progress = null }) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500">
            <CheckIcon size={17} className="text-emerald-950" />
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-white">
            Streakly
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {progress && (
            <LevelBadge level={progress.level} isCoolingOff={progress.isCoolingOff} />
          )}
          <span className="hidden text-[13px] text-slate-500 sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-[9px] border border-slate-700 px-3 py-1.5 text-[13px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
