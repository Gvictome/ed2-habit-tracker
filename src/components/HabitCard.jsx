import { useState } from 'react'
import { calculateStreak, countThisWeek } from '../lib/dates'
import { getColor } from '../lib/habitColors'
import { CheckInRow } from './CheckInRow'
import { HabitForm } from './HabitForm'

export function HabitCard({ habit, onEdit, onDelete, onToggleDay }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [error, setError] = useState(null)

  const completedDays = habit.check_ins.map((checkIn) => checkIn.day)
  const streak = calculateStreak(completedDays)
  const thisWeek = countThisWeek(completedDays)
  const color = getColor(habit.color)
  const hasMetTarget = thisWeek >= habit.target_per_week

  if (isEditing) {
    return (
      <HabitForm
        habit={habit}
        onSubmit={(values) => onEdit(habit.id, values)}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  async function handleToggle(day) {
    const toggleError = await onToggleDay(habit.id, day)
    setError(toggleError)
  }

  async function handleDelete() {
    const deleteError = await onDelete(habit.id)
    if (deleteError) {
      setError(deleteError)
      setIsConfirmingDelete(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} />
            <h3 className="truncate text-base font-semibold text-white">{habit.name}</h3>
          </div>
          {habit.description && (
            <p className="mt-1 text-sm text-slate-400">{habit.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className={streak > 0 ? color.accent : 'text-slate-500'}>
          {streak > 0 ? `${streak} day streak` : 'No streak yet'}
        </span>
        <span className={hasMetTarget ? 'text-emerald-400' : 'text-slate-500'}>
          {thisWeek} of {habit.target_per_week} days this week
          {hasMetTarget ? ' - target met' : ''}
        </span>
      </div>

      <div className="mt-4">
        <CheckInRow
          completedDays={completedDays}
          colorId={habit.color}
          onToggle={handleToggle}
          disabled={isConfirmingDelete}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {isConfirmingDelete && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <p className="text-sm text-red-200">
            Delete &ldquo;{habit.name}&rdquo; and all of its check-ins? This cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-400"
            >
              Delete habit
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
