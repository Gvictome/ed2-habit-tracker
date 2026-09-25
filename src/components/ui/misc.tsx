import { cn } from '@/lib/cn'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-3xl border border-border bg-surface shadow-card', className)}
      {...props}
    />
  )
}

const BADGE_TONES = {
  neutral: 'bg-surface-2 text-muted border-border',
  accent: 'bg-accent/15 text-accent-text border-accent/25',
  success: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
  info: 'bg-info/12 text-info border-info/25',
  habit: 'bg-(--habit)/15 text-(--habit) border-(--habit)/25',
} as const

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof BADGE_TONES }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap [&_svg]:size-3',
        BADGE_TONES[tone],
        className,
      )}
      {...props}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden />
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-3xl border border-dashed border-border-strong px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent-text [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden>
        {/* Always a dark tile so the volt mark reads in both themes. */}
        <rect x="1" y="1" width="62" height="62" rx="15" fill="#0d0f14" className="stroke-white/15" strokeWidth="2" />
        <circle cx="32" cy="32" r="19" fill="none" stroke="#b6f03c" strokeOpacity="0.22" strokeWidth="6" />
        <path d="M32 13a19 19 0 1 1-17.9 12.7" fill="none" stroke="#b6f03c" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M24 32.5l5.5 5.5L41 26.5"
          fill="none"
          stroke="#b6f03c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWord && <span className="font-display text-lg font-bold tracking-tight">Streakly</span>}
    </span>
  )
}
