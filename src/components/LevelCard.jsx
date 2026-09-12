import { MAJORITY_COLD_MULTIPLIER } from '../lib/levels'

function joinNames(names) {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

const PERCENT_CUT = Math.round((1 - MAJORITY_COLD_MULTIPLIER) * 100)

/**
 * Level, and how it is moving. The bar is the honest part: it shows exactly how
 * far into the current level the score sits, so the number never feels arbitrary.
 */
export function LevelCard({ progress }) {
  const { level, title, xp, xpToNextLevel, progressRatio, isCoolingOff, coldNames } = progress

  return (
    <section
      className={`flex flex-col gap-3 rounded-3xl border p-5 ${
        isCoolingOff ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`tabular font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${
            isCoolingOff ? 'bg-amber-500 text-amber-950' : 'bg-emerald-500 text-emerald-950'
          }`}
        >
          {level}
        </span>

        <div className="flex min-w-0 grow flex-col gap-0.5">
          <span
            className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${
              isCoolingOff ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            Level {level}
          </span>
          <span className="font-display truncate text-lg font-bold text-white">{title}</span>
        </div>

        <span className="tabular shrink-0 text-sm font-semibold text-slate-400">
          {xp.toLocaleString()} XP
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress to level ${level + 1}`}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${
              isCoolingOff ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(progressRatio * 100, 2)}%` }}
          />
        </div>
        <span className="tabular text-xs text-slate-500">
          {xpToNextLevel.toLocaleString()} XP to level {level + 1}
        </span>
      </div>

      {isCoolingOff && (
        <p className="text-[13px] leading-snug text-pretty text-amber-200/90">
          Cooling off. {joinNames(coldNames)} {coldNames.length === 1 ? 'has' : 'have'} gone
          quiet, so your score is cut {PERCENT_CUT}%. Check {coldNames.length === 1 ? 'it' : 'one'}{' '}
          off to recover.
        </p>
      )}
    </section>
  )
}
