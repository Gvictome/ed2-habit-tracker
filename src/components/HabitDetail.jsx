import { useState } from 'react'
import {
  calculateBestStreak,
  calculateStreak,
  countThisWeek,
  recentDays,
} from '../lib/dates'
import { getColor } from '../lib/habitColors'
import { DayGrid } from './DayGrid'
import { HabitForm } from './HabitForm'
import { ChevronLeftIcon } from './Icons'

const HISTORY_DAYS = 28

function Stat({ label, value, suffix, accent }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
        {label}
      </span>
      <span className={`tabular font-display text-2xl leading-tight font-bold ${accent ?? 'text-white'}`}>
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-slate-500">{suffix}</span>}
      </span>
    </div>
  )
}

/** One habit in full: stats, an editable week, and a month of history. */
export function HabitDetail({ habit, onBack, onEdit, onDelete, onToggleDay }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState(null)

  const days = habit.check_ins.map((checkIn) => checkIn.day)
  const completed = new Set(days)
  const color = getColor(habit.color)

  const history = recentDays(HISTORY_DAYS)
  const weeks = Array.from({ length: HISTORY_DAYS / 7 }, (_, index) =>
    history.slice(index * 7, index * 7 + 7),
  )
  const hitInHistory = history.filter((day) => completed.has(day.key)).length

  async function handleToggle(day) {
    setError(await onToggleDay(habit.id, day))
  }

  async function handleDelete() {
    const deleteError = await onDelete(habit.id)
    if (deleteError) {
      setError(deleteError)
      setIsConfirmingDelete(false)
      return
    }
    onBack()
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 flex w-fit items-center gap-1.5 rounded-lg py-1 pr-2 pl-1 text-[13px] text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        <ChevronLeftIcon size={15} />
        Today
      </button>

      {isEditing ? (
        <HabitForm
          habit={habit}
          onSubmit={(values) => onEdit(habit.id, values)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} />
                <h1 className="font-display truncate text-2xl font-bold tracking-tight text-white">
                  {habit.name}
                </h1>
              </div>
              {habit.description && <p className="text-sm text-slate-400">{habit.description}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-[10px] border border-slate-700 px-3.5 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="rounded-[10px] border border-rose-500/35 px-3.5 py-2 text-[13px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Current streak" value={calculateStreak(days)} suffix="days" accent={color.text} />
            <Stat label="Best streak" value={calculateBestStreak(days)} suffix="days" />
            <Stat
              label="This week"
              value={countThisWeek(days)}
              suffix={`/ ${habit.target_per_week}`}
            />
          </div>

          <section className="flex flex-col gap-3 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-[13px] font-semibold tracking-[0.09em] text-slate-500 uppercase">
              This week
            </h2>
            <DayGrid
              completedDays={days}
              colorId={habit.color}
              onToggle={handleToggle}
              size="lg"
            />
            <p className="text-[13px] text-slate-600">Tap any day to add or remove a check-in.</p>
          </section>

          <section className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[13px] font-semibold tracking-[0.09em] text-slate-500 uppercase">
                Last four weeks
              </h2>
              <span className="tabular text-xs text-slate-600">
                {hitInHistory} of {HISTORY_DAYS} days
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {weeks.map((week) => (
                <div key={week[0].key} className="flex gap-1.5">
                  {week.map((day) => (
                    <span
                      key={day.key}
                      title={day.key}
                      className={`h-5 w-5 rounded-md ${
                        completed.has(day.key) ? color.solid : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
              {error}
            </p>
          )}

          {isConfirmingDelete && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
              <p className="text-sm text-rose-200">
                Delete &ldquo;{habit.name}&rdquo; and all of its check-ins? This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-[10px] bg-rose-500 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-rose-400"
                >
                  Delete habit
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="rounded-[10px] border border-slate-700 px-3.5 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:border-slate-600"
                >
                  Keep it
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
