import { getColor } from '../lib/habitColors'
import { CheckIcon, ChevronRightIcon } from './Icons'
import { StreakChip } from './StreakChip'

/**
 * One habit, one day. The circle is the primary action and is 44px so it stays
 * a comfortable touch target; the text opens the habit's detail view.
 */
export function TodayRow({ habit, isDone, streak, isCold = false, onToggle, onOpen }) {
  const color = getColor(habit.color)

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border bg-slate-900/60 p-3 transition-colors sm:gap-4 sm:p-4 ${
        isDone ? 'border-slate-800' : 'border-slate-700'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(habit.id)}
        aria-pressed={isDone}
        aria-label={`${isDone ? 'Undo' : 'Complete'} ${habit.name} for today`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
          isDone ? color.solid : 'border-2 border-slate-600 hover:border-slate-500'
        }`}
      >
        <CheckIcon
          size={21}
          className={isDone ? color.onSolid : 'text-slate-700'}
        />
      </button>

      <button
        type="button"
        onClick={() => onOpen(habit.id)}
        aria-label={`Open ${habit.name}`}
        className="flex min-w-0 grow items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold text-white sm:text-base">
            {habit.name}
          </span>
          {isCold ? (
            <span className="truncate text-[13px] font-medium text-amber-400">
              Gone quiet - costing you XP
            </span>
          ) : (
            habit.description && (
              <span className="truncate text-[13px] text-slate-500">{habit.description}</span>
            )
          )}
        </span>
        <ChevronRightIcon size={16} className="shrink-0 text-slate-600" />
      </button>

      <StreakChip streak={streak} colorId={habit.color} />
    </div>
  )
}
