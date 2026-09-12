/** Placeholder rows shown while the first habit fetch is in flight. */
export function Skeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading your habits">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-800" />
          <div className="flex grow flex-col gap-2">
            <span className="h-3.5 w-32 animate-pulse rounded bg-slate-800" />
            <span className="h-3 w-48 animate-pulse rounded bg-slate-800/70" />
          </div>
        </div>
      ))}
    </div>
  )
}
