import { CheckIcon } from './Icons'

export function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-slate-700 px-6 py-12 text-center sm:py-14">
      <div className="mb-3 flex gap-2">
        <span className="h-8 w-8 rounded-[10px] border border-slate-800" />
        <span className="h-8 w-8 rounded-[10px] border border-slate-800" />
        <span className="h-8 w-8 rounded-[10px] bg-emerald-500/25" />
        <span className="h-8 w-8 rounded-[10px] bg-emerald-500/55" />
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500">
          <CheckIcon size={17} className="text-emerald-950" />
        </span>
      </div>
      <h2 className="font-display text-xl font-bold text-white">Start your first streak</h2>
      <p className="max-w-xs text-sm leading-relaxed text-pretty text-slate-400">
        Pick one thing you want to do consistently. Check it off today and the streak starts
        counting.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 transition-transform duration-150 hover:bg-emerald-400 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        Add a habit
      </button>
    </div>
  )
}
