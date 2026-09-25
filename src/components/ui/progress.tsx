import { cn } from '@/lib/cn'

interface RingProps {
  /** 0 to 1. */
  value: number
  size?: number
  stroke?: number
  className?: string
  /** CSS colour for the filled arc; defaults to the habit colour, then the accent. */
  color?: string
  children?: React.ReactNode
  label?: string
}

/** SVG progress ring. The arc animates with a CSS transition on stroke-dashoffset. */
export function Ring({ value, size = 56, stroke = 6, className, color, children, label }: RingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color ?? 'var(--habit, var(--accent))'}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  )
}

interface BarProps {
  value: number
  className?: string
  color?: string
  label?: string
}

export function ProgressBar({ value, className, color, label }: BarProps) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-label={label}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped * 100}%`,
          background: color ?? 'var(--habit, var(--accent))',
          transition: 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  )
}
