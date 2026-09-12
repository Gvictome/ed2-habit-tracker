import { getColor } from '../lib/habitColors'
import { FlameIcon } from './Icons'

export function StreakChip({ streak, colorId }) {
  const color = getColor(colorId)
  const isCold = streak === 0

  return (
    <span
      title={isCold ? 'No streak yet' : `${streak} day streak`}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 ${
        isCold ? 'bg-slate-800/60' : color.tint
      }`}
    >
      <FlameIcon size={13} className={isCold ? 'text-slate-600' : color.text} />
      <span className={`tabular text-[13px] font-semibold ${isCold ? 'text-slate-600' : color.text}`}>
        {streak}
      </span>
    </span>
  )
}
