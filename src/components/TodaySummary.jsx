import { formatLongDate } from '../lib/dates'
import { ProgressRing } from './ProgressRing'

function summarise(done, total, bestName, bestStreak) {
  if (total === 0) return 'Nothing tracked yet.'
  if (done === total) return 'Everything done. That is the whole day cleared.'

  const left = total - done
  const phrase = left === 1 ? 'One habit left' : `${left} habits left`
  if (bestStreak > 1) {
    return `${phrase}. Your longest run is ${bestStreak} days on ${bestName}.`
  }
  return `${phrase}. Check one off to start a streak.`
}

/** The day at a glance: how much is done, and what is still open. */
export function TodaySummary({ done, total, bestName, bestStreak }) {
  return (
    <section className="flex items-center gap-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:gap-6 sm:p-6">
      <ProgressRing done={done} total={total} size={84} stroke={8} />
      <div className="flex min-w-0 grow flex-col gap-1.5">
        <span className="text-[11px] font-semibold tracking-[0.1em] text-emerald-400 uppercase">
          Today
        </span>
        <h1 className="font-display text-xl leading-tight font-bold tracking-tight text-balance text-white sm:text-2xl">
          {formatLongDate()}
        </h1>
        <p className="text-[13px] leading-snug text-pretty text-slate-400 sm:text-sm">
          {summarise(done, total, bestName, bestStreak)}
        </p>
      </div>
    </section>
  )
}
