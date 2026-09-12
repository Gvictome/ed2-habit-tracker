import { recentDays } from '../lib/dates'
import { getColor } from '../lib/habitColors'

/**
 * A row of day toggles, oldest on the left and today on the right. Clicking a
 * box creates or deletes that day's check-in.
 */
export function DayGrid({ completedDays, colorId, onToggle, size = 'sm' }) {
  const color = getColor(colorId)
  const completed = new Set(completedDays)
  const box = size === 'lg' ? 'h-10 w-10 text-xs' : 'h-[30px] w-[30px] text-[11px]'

  return (
    <div className="flex gap-1.5">
      {recentDays(7).map((day) => {
        const isDone = completed.has(day.key)
        return (
          <button
            key={day.key}
            type="button"
            onClick={() => onToggle(day.key)}
            aria-pressed={isDone}
            aria-label={`${day.key}${isDone ? ', completed' : ', not completed'}`}
            title={day.key}
            className={`tabular flex shrink-0 items-center justify-center rounded-[9px] font-medium transition-transform duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${box} ${
              isDone
                ? `${color.solid} ${color.onSolid} font-semibold`
                : 'border border-slate-800 text-slate-600 hover:border-slate-600'
            } ${day.isToday ? 'outline-2 outline-offset-2 outline-slate-300' : ''}`}
          >
            {day.dayOfMonth}
          </button>
        )
      })}
    </div>
  )
}
