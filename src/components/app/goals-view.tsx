'use client'

import { Goal as GoalIcon, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState, Skeleton } from '@/components/ui/misc'
import { Segmented } from '@/components/ui/segmented'
import { goalProgress, type GoalStatus } from '@/lib/goals'
import { StatTile } from './charts'
import { useData } from './data-provider'
import { GoalCard } from './goal-card'
import { GoalDialog } from './goal-dialog'
import { PageHeader } from './page-header'
import { useToday } from './use-today'

type Filter = 'active' | 'complete' | 'all'

/** Most urgent first. */
const STATUS_RANK: Record<GoalStatus, number> = { overdue: 0, behind: 1, on_track: 2, no_deadline: 3, complete: 4 }

export function GoalsView() {
  const { goals, habits } = useData()
  const { now } = useToday()
  const [filter, setFilter] = useState<Filter>('active')
  const [dialog, setDialog] = useState<{ open: boolean; goalId?: string }>({ open: false })

  const rows = useMemo(() => {
    if (!now) return []
    return goals.flatMap((goal) => {
      const habit = habits.find((item) => item.id === goal.habit_id)
      return habit ? [{ goal, habit, progress: goalProgress(goal, habit, now) }] : []
    })
  }, [goals, habits, now])

  const visible = rows
    .filter((row) => {
      if (filter === 'all') return true
      return filter === 'complete' ? row.progress.isComplete : !row.progress.isComplete
    })
    .sort(
      (a, b) =>
        STATUS_RANK[a.progress.status] - STATUS_RANK[b.progress.status] ||
        (a.goal.deadline ?? '9999').localeCompare(b.goal.deadline ?? '9999') ||
        b.progress.ratio - a.progress.ratio,
    )

  const completed = rows.filter((row) => row.progress.isComplete).length
  const onTrack = rows.filter((row) => row.progress.status === 'on_track').length
  const needsAttention = rows.filter((row) => row.progress.status === 'behind' || row.progress.status === 'overdue').length

  return (
    <>
      <PageHeader
        eyebrow="Long-range"
        title="Goals"
        description="Set a target on any habit, with an optional deadline. Streakly projects your finish date from your real pace."
        actions={
          <Button onClick={() => setDialog({ open: true })} disabled={habits.length === 0}>
            <Plus /> New goal
          </Button>
        }
      />

      {!now ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<GoalIcon />}
          title={habits.length === 0 ? 'Create a habit first' : 'No goals yet'}
          description={
            habits.length === 0
              ? 'Goals attach to a habit. Add one on the Today page, then come back.'
              : 'Try "Read 500 pages by December" or "Hit a 30-day meditation streak".'
          }
          action={
            habits.length > 0 && (
              <Button onClick={() => setDialog({ open: true })}>
                <Plus /> Set your first goal
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <StatTile label="Completed" value={completed} hint={`of ${rows.length} goals`} />
            <StatTile label="On track" value={onTrack} hint="with a deadline" />
            <StatTile label="Needs attention" value={needsAttention} hint="behind or overdue" />
          </div>
          <Segmented<Filter>
            label="Filter goals"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'complete', label: 'Completed' },
              { value: 'all', label: 'All' },
            ]}
            className="mb-4"
          />
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted">
              {filter === 'complete' ? 'No completed goals yet. You will get there.' : 'Every goal is complete. Set a bigger one?'}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visible.map(({ goal, habit, progress }) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  habit={habit}
                  progress={progress}
                  onEdit={() => setDialog({ open: true, goalId: goal.id })}
                />
              ))}
            </div>
          )}
        </>
      )}

      <GoalDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open })}
        goal={goals.find((goal) => goal.id === dialog.goalId)}
      />
    </>
  )
}
