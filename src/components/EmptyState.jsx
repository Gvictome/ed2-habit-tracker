export function EmptyState({ onCreate }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-14 text-center">
      <h2 className="text-base font-semibold text-white">No habits yet</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-400">
        Add the first thing you want to do consistently. Check off a day to start a streak.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
      >
        Add your first habit
      </button>
    </div>
  )
}
