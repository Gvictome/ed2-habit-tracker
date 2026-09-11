import { recentDays } from '../lib/dates'
import { getColor } from '../lib/habitColors'

/**
 * A row of seven toggles, oldest day on the left and today on the right.
 * Clicking a box creates or deletes that day's check-in row in the database.
 */
export function CheckInRow({ completedDays, colorId, onToggle, disabled }) {
  const color = getColor(colorId)
  const completed = new Set(completedDays)

  return (
    <div className="flex gap-1.5">
      {recentDays(7).map((day) => {
        const isDone = completed.has(day.key)
        return (
          <button
            key={day.key}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(day.key)}
            aria-pressed={isDone}
            aria-label={`${day.key}${isDone ? ', completed' : ', not completed'}`}
            title={day.key}
            className={`flex h-9 w-9 flex-col items-center justify-center rounded-lg border text-[10px] font-medium transition disabled:cursor-not-allowed ${
              isDone
                ? `${color.filled} text-slate-950`
                : 'border-slate-700 bg-slate-950 text-slate-500 hover:border-slate-500'
            } ${day.isToday && !isDone ? 'border-slate-500' : ''}`}
          >
            <span className="leading-none">{day.weekday}</span>
            <span className="mt-0.5 leading-none opacity-70">{day.dayOfMonth}</span>
          </button>
        )
      })}
    </div>
  )
}
