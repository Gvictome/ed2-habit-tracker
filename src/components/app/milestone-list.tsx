import { Award, Flame, Lock, Trophy } from 'lucide-react'
import { ProgressBar } from '@/components/ui/progress'
import { cn } from '@/lib/cn'
import { formatMediumDate } from '@/lib/dates'
import type { Milestone } from '@/lib/milestones'

function MilestoneIcon({ milestone }: { milestone: Milestone }) {
  if (milestone.kind === 'streak') return <Flame />
  if (milestone.kind === 'overall') return <Trophy />
  return <Award />
}

const TONE: Record<Milestone['kind'], string> = {
  streak: 'bg-orange-500/15 text-orange-500',
  total: 'bg-sky-500/15 text-sky-500',
  overall: 'bg-amber-500/15 text-amber-500',
}

/** Earned milestones as a dated timeline. */
export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border-strong p-6 text-center text-sm text-muted">Your first milestone is one check-in away.</p>
  }
  return (
    <ol className="relative flex flex-col gap-4 border-l border-border pl-6">
      {milestones.map((milestone) => (
        <li key={milestone.id} className="relative">
          <span className={cn('absolute top-0.5 -left-[37px] grid size-7 place-items-center rounded-full ring-4 ring-surface [&_svg]:size-3.5', TONE[milestone.kind])}>
            <MilestoneIcon milestone={milestone} />
          </span>
          <p className="text-sm font-semibold">{milestone.title}</p>
          <p className="text-xs text-muted">
            {milestone.description}
            {milestone.achievedOn && <> · {formatMediumDate(milestone.achievedOn)}</>}
          </p>
        </li>
      ))}
    </ol>
  )
}

/** Unearned milestones with how close each one is. */
export function MilestoneProgressList({ milestones }: { milestones: Milestone[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {milestones.map((milestone) => (
        <li key={milestone.id} className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-faint [&_svg]:size-4">
            <Lock />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-semibold">{milestone.title}</p>
              <span className="tabular text-xs text-muted">{Math.round(milestone.progress * 100)}%</span>
            </div>
            <p className="truncate text-xs text-muted">{milestone.description}</p>
            <ProgressBar value={milestone.progress} className="mt-1.5 h-1.5" color="var(--accent)" label={`${milestone.title} progress`} />
          </div>
        </li>
      ))}
    </ul>
  )
}
