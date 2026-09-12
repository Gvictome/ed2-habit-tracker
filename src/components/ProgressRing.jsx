const TAU = 2 * Math.PI

/**
 * Circular progress for the day. The dash offset animates so checking a habit
 * off visibly advances the ring rather than snapping.
 */
export function ProgressRing({ done, total, size = 92, stroke = 9 }) {
  const radius = size / 2 - stroke / 2 - 1
  const circumference = TAU * radius
  const ratio = total === 0 ? 0 : Math.min(done / total, 1)
  const center = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-800"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${center} ${center})`}
          className="stroke-emerald-500 transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="tabular font-display leading-none font-bold text-white"
          style={{ fontSize: Math.round(size * 0.27) }}
        >
          {done}/{total}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          done
        </span>
      </div>
    </div>
  )
}
