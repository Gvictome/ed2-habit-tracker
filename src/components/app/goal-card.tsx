'use client'

import { CalendarClock, CircleCheckBig, MoreHorizontal, Pencil, Target, Trash2, TrendingUp } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import Link from 'next/link'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Badge, Card } from '@/components/ui/misc'
import { ProgressBar } from '@/components/ui/progress'
import { habitStyle } from '@/lib/colors'
import { formatMediumDate } from '@/lib/dates'
import { formatAmount } from '@/lib/habits'
import type { GoalProgress, GoalStatus } from '@/lib/goals'
import type { Goal, Habit } from '@/lib/types'
import { useData } from './data-provider'

const STATUS: Record<GoalStatus, { label: string; tone: 'success' | 'accent' | 'warning' | 'danger' | 'neutral' }> = {
  complete: { label: 'Complete', tone: 'success' },
  on_track: { label: 'On track', tone: 'accent' },
  behind: { label: 'Behind pace', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'danger' },
  no_deadline: { label: 'In progress', tone: 'neutral' },
}

function describeTarget(goal: Goal, habit: Habit): string {
  if (goal.kind === 'streak') return `${goal.target}-day streak`
  if (goal.kind === 'total_amount') return formatAmount(goal.target, habit.unit)
  return `${goal.target} days`
}

function describeCurrent(goal: Goal, habit: Habit, progress: GoalProgress): string {
  if (goal.kind === 'total_amount') return formatAmount(progress.current, habit.unit)
  if (goal.kind === 'streak') return `${progress.current} in a row`
  return `${progress.current} ${progress.current === 1 ? 'day' : 'days'}`
}

interface GoalCardProps {
  goal: Goal
  habit: Habit
  progress: GoalProgress
  onEdit: () => void
}

export function GoalCard({ goal, habit, progress, onEdit }: GoalCardProps) {
  const { removeGoal } = useData()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const status = STATUS[progress.status]

  return (
    <Card className="flex flex-col gap-4 p-5" style={habitStyle(habit.color)}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-(--habit)/12 text-xl">
          {progress.isComplete ? <CircleCheckBig className="size-5 text-(--habit)" /> : habit.icon || <Target className="size-5 text-(--habit)" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold leading-tight">{goal.title}</p>
          <Link href={`/habits/${habit.id}`} className="text-xs text-muted hover:text-foreground">
            {habit.name} · {describeTarget(goal, habit)}
          </Link>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground" aria-label="Goal actions">
            <MoreHorizontal className="size-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-40 rounded-xl border border-border-strong bg-surface p-1 shadow-card">
              <DropdownMenu.Item onSelect={onEdit} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-surface-2">
                <Pencil className="size-4" /> Edit goal
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setIsConfirming(true)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger outline-none data-highlighted:bg-danger/10">
                <Trash2 className="size-4" /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="tabular font-display text-2xl font-bold">{Math.round(progress.ratio * 100)}%</p>
          <p className="tabular text-xs text-muted">
            {describeCurrent(goal, habit, progress)} of {describeTarget(goal, habit)}
          </p>
        </div>
        <ProgressBar value={progress.ratio} className="h-2.5" label={`${goal.title} progress`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge tone={status.tone}>{status.label}</Badge>
        {goal.deadline && (
          <span className="flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {progress.daysLeft !== null && progress.daysLeft >= 0
              ? `${progress.daysLeft} ${progress.daysLeft === 1 ? 'day' : 'days'} left`
              : `Due ${formatMediumDate(goal.deadline)}`}
          </span>
        )}
        {progress.projectedDate && !progress.isComplete && (
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3.5" /> On pace for {formatMediumDate(progress.projectedDate)}
          </span>
        )}
        {!progress.projectedDate && !progress.isComplete && <span>Log a day to see your pace</span>}
      </div>

      <ConfirmDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title="Delete this goal?"
        description={`"${goal.title}" will be removed. Your check-ins stay.`}
        confirmLabel="Delete goal"
        isLoading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true)
          const ok = await removeGoal(goal.id)
          setIsDeleting(false)
          if (ok) setIsConfirming(false)
        }}
      />
    </Card>
  )
}
