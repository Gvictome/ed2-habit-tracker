import { countThisWeek } from '../lib/dates'
import { DayGrid } from './DayGrid'
import { getColor } from '../lib/habitColors'

/**
 * The last seven days for every habit. Secondary to the Today list: this is
 * where you fix a day you forgot to check off, not the main interaction.
 */
export function WeekHistory({ habits, onToggleDay }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold tracking-[0.09em] text-slate-500 uppercase">
        Last 7 days
      </h2>

      <div className="flex flex-col gap-3 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        {habits.map((habit, index) => {
          const days = habit.check_ins.map((checkIn) => checkIn.day)
          const hit = countThisWeek(days)
          const color = getColor(habit.color)
          const metTarget = hit >= habit.target_per_week

          return (
            <div key={habit.id} className="flex flex-col gap-3">
              {index > 0 && <div className="h-px bg-slate-800" />}
              <div className="flex min-w-max items-center justify-between gap-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${color.dot}`} />
                  <span className="truncate text-sm font-medium text-slate-300">{habit.name}</span>
                  <span
                    className={`tabular shrink-0 text-xs ${metTarget ? 'text-emerald-400' : 'text-slate-600'}`}
                  >
                    {hit} / {habit.target_per_week} target
                  </span>
                </div>
                <DayGrid
                  completedDays={days}
                  colorId={habit.color}
                  onToggle={(day) => onToggleDay(habit.id, day)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
