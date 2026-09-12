import { useState } from 'react'
import { DEFAULT_COLOR, HABIT_COLORS } from '../lib/habitColors'

const MAX_NAME = 80
const MAX_DESCRIPTION = 280

function toFormState(habit) {
  return {
    name: habit?.name ?? '',
    description: habit?.description ?? '',
    color: habit?.color ?? DEFAULT_COLOR,
    targetPerWeek: habit?.target_per_week ?? 7,
  }
}

/**
 * Create and edit take the same fields, so one form serves both. `habit` is
 * null when creating. `onSubmit` returns an error message, or null on success.
 */
export function HabitForm({ habit = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toFormState(habit))
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Give the habit a name.')
      return
    }

    setIsSaving(true)
    const submitError = await onSubmit(form)
    setIsSaving(false)

    if (submitError) {
      setError(submitError)
      return
    }
    onCancel()
  }

  const field =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white transition-colors outline-none placeholder:text-slate-600 focus:border-emerald-500'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5"
    >
      <h2 className="font-display text-base font-bold text-white">
        {habit ? 'Edit habit' : 'New habit'}
      </h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400" htmlFor="habit-name">
          Name
        </label>
        <input
          id="habit-name"
          value={form.name}
          maxLength={MAX_NAME}
          autoFocus
          onChange={(event) => update('name', event.target.value)}
          placeholder="Read for 20 minutes"
          className={field}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400" htmlFor="habit-description">
          Notes <span className="font-normal text-slate-600">(optional)</span>
        </label>
        <textarea
          id="habit-description"
          value={form.description}
          maxLength={MAX_DESCRIPTION}
          rows={2}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Why this matters, or how you will do it"
          className={`${field} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400">Colour</span>
          <div className="flex gap-2">
            {HABIT_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                aria-label={color.label}
                aria-pressed={form.color === color.id}
                onClick={() => update('color', color.id)}
                className={`h-7 w-7 rounded-full transition-all ${color.dot} ${
                  form.color === color.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                    : 'opacity-55 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400" htmlFor="habit-target">
            Days per week
          </label>
          <select
            id="habit-target"
            value={form.targetPerWeek}
            onChange={(event) => update('targetPerWeek', Number(event.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? 'day' : 'days'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition-transform duration-150 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          {isSaving ? 'Saving...' : habit ? 'Save changes' : 'Add habit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
