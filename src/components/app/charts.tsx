'use client'

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/cn'
import { formatMediumDate } from '@/lib/dates'
import type { HeatCell, SeriesPoint } from '@/lib/stats'

/** Five-step intensity scale; level 0 is an empty (but existing) day. */
function heatLevel(cell: HeatCell): number {
  if (cell.possible === 0 || cell.done === 0) return 0
  if (cell.ratio >= 1) return 4
  if (cell.ratio >= 0.66) return 3
  if (cell.ratio >= 0.33) return 2
  return 1
}

const HEAT_CLASSES = ['bg-surface-3', 'bg-(--heat)/25', 'bg-(--heat)/50', 'bg-(--heat)/75', 'bg-(--heat)']

interface HeatmapProps {
  weeks: HeatCell[][]
  /** CSS colour; defaults to the brand accent. */
  color?: string
  weekStart: 0 | 1
}

/** GitHub-style contribution grid: columns are weeks, rows are weekdays. */
export function Heatmap({ weeks, color = 'var(--accent)', weekStart }: HeatmapProps) {
  const dayLabels = weekStart === 1 ? ['Mon', '', 'Wed', '', 'Fri', '', ''] : ['', 'Mon', '', 'Wed', '', 'Fri', '']
  return (
    <div className="flex flex-col gap-3" style={{ ['--heat' as string]: color }}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <div className="grid shrink-0 grid-rows-7 gap-1 text-[10px] text-faint">
          {dayLabels.map((label, index) => (
            <span key={index} className="flex h-3.5 items-center sm:h-4">
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-1" aria-label="Completion heatmap" role="img">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((cell) => (
                <div
                  key={cell.key}
                  title={
                    cell.isFuture
                      ? formatMediumDate(cell.key)
                      : `${formatMediumDate(cell.key)}: ${cell.done} of ${cell.possible} done`
                  }
                  className={cn(
                    'size-3.5 rounded-[4px] transition-colors sm:size-4',
                    cell.isFuture ? 'bg-transparent' : HEAT_CLASSES[heatLevel(cell)],
                    cell.isToday && 'ring-1 ring-foreground/60 ring-offset-1 ring-offset-surface',
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-faint">
        Less
        {HEAT_CLASSES.map((className, index) => (
          <span key={index} className={cn('size-3 rounded-[3px]', className)} />
        ))}
        More
      </div>
    </div>
  )
}

interface TrendTooltipProps {
  active?: boolean
  payload?: Array<{ payload: SeriesPoint }>
  unit?: string
  isBinary?: boolean
}

function TrendTooltip({ active, payload, unit, isBinary }: TrendTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs shadow-card">
      <p className="font-semibold">{point.label}</p>
      <p className="tabular text-muted">{isBinary ? (point.value ? 'Done' : 'Not done') : `${point.value} ${unit ?? ''}`}</p>
    </div>
  )
}

interface TrendChartProps {
  data: SeriesPoint[]
  color: string
  target?: number | null
  unit?: string
  isBinary?: boolean
}

/** Daily bars for the last N days, with the daily target drawn as a dashed line. */
export function TrendChart({ data, color, target, unit, isBinary }: TrendChartProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--faint)', fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--faint)', fontSize: 10 }}
            allowDecimals={false}
            domain={isBinary ? [0, 1] : [0, 'auto']}
            ticks={isBinary ? [0, 1] : undefined}
          />
          <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<TrendTooltip unit={unit} isBinary={isBinary} />} />
          {target ? <ReferenceLine y={target} stroke={color} strokeDasharray="4 4" strokeOpacity={0.7} /> : null}
          <Bar dataKey="value" fill={color} radius={[6, 6, 2, 2]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface StatTileProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function StatTile({ label, value, hint, icon, className }: StatTileProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-4 shadow-card', className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      <p className="tabular mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
