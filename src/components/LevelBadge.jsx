/** Compact level marker for the header. */
export function LevelBadge({ level, isCoolingOff }) {
  return (
    <span
      title={isCoolingOff ? 'Cooling off: most habits have gone quiet' : `Level ${level}`}
      className={`tabular font-display flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
        isCoolingOff ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
      }`}
    >
      <span className="text-[10px] font-semibold opacity-70">LV</span>
      {level}
    </span>
  )
}
