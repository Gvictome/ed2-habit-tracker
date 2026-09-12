import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHabits } from '../hooks/useHabits'
import { calculateStreak, isCompletedToday, todayKey } from '../lib/dates'
import { EmptyState } from './EmptyState'
import { HabitDetail } from './HabitDetail'
import { HabitForm } from './HabitForm'
import { Header } from './Header'
import { PlusIcon } from './Icons'
import { Skeleton } from './Skeleton'
import { TodayRow } from './TodayRow'
import { TodaySummary } from './TodaySummary'
import { WeekHistory } from './WeekHistory'

export function Dashboard() {
  const { user } = useAuth()
  const { habits, isLoading, error, addHabit, editHabit, removeHabit, toggleDay } = useHabits(
    user.id,
  )
  const [isCreating, setIsCreating] = useState(false)
  const [openHabitId, setOpenHabitId] = useState(null)
  const [rowError, setRowError] = useState(null)

  // Derive per-habit state once rather than recomputing it in every child.
  const rows = useMemo(
    () =>
      habits.map((habit) => {
        const days = habit.check_ins.map((checkIn) => checkIn.day)
        return {
          habit,
          streak: calculateStreak(days),
          isDone: isCompletedToday(days),
        }
      }),
    [habits],
  )

  const doneToday = rows.filter((row) => row.isDone).length
  const leader = rows.reduce(
    (best, row) => (row.streak > best.streak ? row : best),
    { streak: 0, habit: null },
  )

  async function handleToggle(habitId, day) {
    setRowError(await toggleDay(habitId, day))
  }

  /** The Today list always acts on the current day. */
  async function handleToggleToday(habitId) {
    setRowError(await toggleDay(habitId, todayKey()))
  }

  const openHabit = habits.find((habit) => habit.id === openHabitId) ?? null

  return (
    <div className="min-h-dvh">
      <Header />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {openHabit ? (
          <HabitDetail
            habit={openHabit}
            onBack={() => setOpenHabitId(null)}
            onEdit={editHabit}
            onDelete={removeHabit}
            onToggleDay={toggleDay}
          />
        ) : (
          <>
            <TodaySummary
              done={doneToday}
              total={habits.length}
              bestName={leader.habit?.name}
              bestStreak={leader.streak}
            />

            {(error || rowError) && (
              <p
                role="alert"
                className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300"
              >
                {error ?? rowError}
              </p>
            )}

            {isCreating && (
              <HabitForm onSubmit={addHabit} onCancel={() => setIsCreating(false)} />
            )}

            {isLoading ? (
              <Skeleton />
            ) : habits.length === 0 ? (
              !isCreating && <EmptyState onCreate={() => setIsCreating(true)} />
            ) : (
              <>
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[13px] font-semibold tracking-[0.09em] text-slate-500 uppercase">
                      Check off today
                    </h2>
                    {!isCreating && (
                      <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-1.5 rounded-[10px] bg-emerald-500 py-2 pr-3.5 pl-3 text-[13px] font-bold text-emerald-950 transition-transform duration-150 hover:bg-emerald-400 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                      >
                        <PlusIcon size={15} />
                        New habit
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {rows.map((row) => (
                      <TodayRow
                        key={row.habit.id}
                        habit={row.habit}
                        isDone={row.isDone}
                        streak={row.streak}
                        onToggle={handleToggleToday}
                        onOpen={setOpenHabitId}
                      />
                    ))}
                  </div>
                </section>

                <WeekHistory habits={habits} onToggleDay={handleToggle} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
