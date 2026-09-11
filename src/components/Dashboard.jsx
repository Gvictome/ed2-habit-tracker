import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHabits } from '../hooks/useHabits'
import { EmptyState } from './EmptyState'
import { HabitCard } from './HabitCard'
import { HabitForm } from './HabitForm'
import { Header } from './Header'
import { Spinner } from './Spinner'

export function Dashboard() {
  const { user } = useAuth()
  const { habits, isLoading, error, addHabit, editHabit, removeHabit, toggleDay } = useHabits(
    user.id,
  )
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Your habits</h1>
            <p className="mt-1 text-sm text-slate-400">
              {habits.length === 0
                ? 'Nothing tracked yet.'
                : `Tracking ${habits.length} ${habits.length === 1 ? 'habit' : 'habits'}.`}
            </p>
          </div>
          {!isCreating && habits.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              New habit
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {isCreating && (
          <div className="mb-5">
            <HabitForm onSubmit={addHabit} onCancel={() => setIsCreating(false)} />
          </div>
        )}

        {isLoading ? (
          <Spinner label="Loading your habits" />
        ) : habits.length === 0 && !isCreating ? (
          <EmptyState onCreate={() => setIsCreating(true)} />
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={editHabit}
                onDelete={removeHabit}
                onToggleDay={toggleDay}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
