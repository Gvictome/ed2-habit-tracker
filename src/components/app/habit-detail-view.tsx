'use client'

import { ArrowLeft, CalendarRange, Flame, MessageSquareText, Pencil, Percent, Plus, Sigma, Target, Trash2, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Card, EmptyState, Skeleton } from '@/components/ui/misc'
import { Segmented } from '@/components/ui/segmented'
import { getColor, habitStyle } from '@/lib/colors'
import { formatMediumDate } from '@/lib/dates'
import { goalProgress } from '@/lib/goals'
import { formatAmount, habitStats, isMeasured } from '@/lib/habits'
import { habitMilestones } from '@/lib/milestones'
import { valueSeries } from '@/lib/stats'
import { StatTile, TrendChart } from './charts'
import { useData } from './data-provider'
import { EntryDialog } from './entry-dialog'
import { GoalCard } from './goal-card'
import { GoalDialog } from './goal-dialog'
import { HabitControl } from './habit-control'
import { HabitDialog } from './habit-dialog'
import { MilestoneProgressList, MilestoneTimeline } from './milestone-list'
import { MonthCalendar } from './month-calendar'
import { useToday } from './use-today'

type Range = '14' | '30' | '90'

export function HabitDetailView({ habitId }: { habitId: string }) {
  const { habits, goals, profile, removeHabit } = useData()
  const { key: todayKey, now } = useToday()
  const router = useRouter()
  const habit = habits.find((item) => item.id === habitId)

  const [isEditing, setIsEditing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [entryDay, setEntryDay] = useState<string | null>(null)
  const [goalDialog, setGoalDialog] = useState<{ open: boolean; goalId?: string }>({ open: false })
  const [range, setRange] = useState<Range>('30')

  const stats = useMemo(() => (habit && now ? habitStats(habit, now) : null), [habit, now])
  const series = useMemo(() => (habit && now ? valueSeries(habit, Number(range), now) : []), [habit, now, range])
  const habitGoals = useMemo(
    () => (habit && now ? goals.filter((goal) => goal.habit_id === habit.id).map((goal) => ({ goal, progress: goalProgress(goal, habit, now) })) : []),
    [goals, habit, now],
  )
  const milestones = useMemo(() => (habit ? habitMilestones(habit) : []), [habit])
  const notes = useMemo(
    () => (habit ? habit.check_ins.filter((entry) => entry.note).sort((a, b) => b.day.localeCompare(a.day)).slice(0, 6) : []),
    [habit],
  )

  if (!habit) {
    return (
      <EmptyState
        icon={<Target />}
        title="Habit not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Button asChild variant="secondary">
            <Link href="/habits">Back to habits</Link>
          </Button>
        }
      />
    )
  }

  const color = getColor(habit.color).hex
  const measured = isMeasured(habit)
  const earned = milestones.filter((milestone) => milestone.achievedOn).sort((a, b) => (b.achievedOn ?? '').localeCompare(a.achievedOn ?? ''))
  const upcoming = milestones.filter((milestone) => !milestone.achievedOn).sort((a, b) => b.progress - a.progress).slice(0, 3)
  const editingGoal = goals.find((goal) => goal.id === goalDialog.goalId)

  return (
    <div style={habitStyle(habit.color)}>
      <Link href="/habits" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> Habits
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-(--habit)/15 text-3xl shadow-[0_10px_30px_-12px_var(--habit)]">
          {habit.icon || habit.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">{habit.name}</h1>
          <p className="text-sm text-muted">
            {measured ? `${formatAmount(Number(habit.daily_target), habit.unit)} a day` : 'Done / not done'} ·{' '}
            {habit.target_per_week === 7 ? 'every day' : `${habit.target_per_week} days a week`} · since{' '}
            {formatMediumDate(new Date(habit.created_at))}
          </p>
          {habit.description && <p className="mt-1 text-sm text-muted italic">{habit.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {todayKey && <HabitControl habit={habit} day={todayKey} size="lg" onOpenEntry={() => setEntryDay(todayKey)} />}
          <Button variant="secondary" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit habit">
            <Pencil />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setIsConfirming(true)} aria-label="Delete habit" className="hover:text-danger">
            <Trash2 />
          </Button>
        </div>
      </div>

      {!stats || !todayKey ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={<Flame className="text-orange-500" />} label="Current streak" value={`${stats.streak}d`} hint={stats.isDoneToday ? 'Done today' : stats.streak > 0 ? 'Log today to extend it' : 'Start one today'} />
            <StatTile icon={<Trophy className="text-amber-500" />} label="Best streak" value={`${stats.bestStreak}d`} hint={`${stats.totalDays} completed days`} />
            <StatTile icon={<Percent />} label="30-day rate" value={`${Math.round(stats.completionRate * 100)}%`} hint={`Target ${habit.target_per_week}× a week`} />
            {measured ? (
              <StatTile icon={<Sigma />} label="Total logged" value={formatAmount(stats.totalAmount)} hint={habit.unit} />
            ) : (
              <StatTile icon={<CalendarRange />} label="This week" value={`${stats.thisWeek}/${habit.target_per_week}`} hint="Last 7 days" />
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-2">
              <MonthCalendar habit={habit} todayKey={todayKey} weekStart={profile.week_start} onSelectDay={setEntryDay} />
              <p className="mt-3 text-xs text-muted">Tap any past day to log it, change the amount, or add a note.</p>
            </Card>
            <Card className="p-5 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-display font-semibold">{measured ? `Daily ${habit.unit}` : 'Daily completion'}</h2>
                <Segmented<Range>
                  label="Chart range"
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: '14', label: '14d' },
                    { value: '30', label: '30d' },
                    { value: '90', label: '90d' },
                  ]}
                />
              </div>
              <TrendChart data={series} color={color} target={measured ? habit.daily_target : null} unit={habit.unit} isBinary={!measured} />
            </Card>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Goals</h2>
              <Button variant="secondary" size="sm" onClick={() => setGoalDialog({ open: true })}>
                <Plus /> Add goal
              </Button>
            </div>
            {habitGoals.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border-strong p-6 text-center text-sm text-muted">
                No goals yet. Set a target like {measured ? `100 ${habit.unit}` : '30 days'} or a 14-day streak.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {habitGoals.map(({ goal, progress }) => (
                  <GoalCard key={goal.id} goal={goal} habit={habit} progress={progress} onEdit={() => setGoalDialog({ open: true, goalId: goal.id })} />
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">Milestones earned</h2>
              <MilestoneTimeline milestones={earned} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">Up next</h2>
              <MilestoneProgressList milestones={upcoming} />
            </Card>
          </div>

          {notes.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                <MessageSquareText className="size-5 text-muted" /> Recent notes
              </h2>
              <ul className="flex flex-col divide-y divide-border">
                {notes.map((entry) => (
                  <li key={entry.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <button type="button" onClick={() => setEntryDay(entry.day)} className="tabular w-24 shrink-0 text-left text-xs font-semibold text-muted hover:text-foreground">
                      {formatMediumDate(entry.day)}
                    </button>
                    <p className="text-sm">{entry.note}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <HabitDialog open={isEditing} onOpenChange={setIsEditing} habit={habit} />
      <EntryDialog habit={entryDay ? habit : null} day={entryDay} onOpenChange={(open) => !open && setEntryDay(null)} />
      <GoalDialog open={goalDialog.open} onOpenChange={(open) => setGoalDialog({ open })} goal={editingGoal} habitId={habit.id} />
      <ConfirmDialog
        open={isConfirming}
        onOpenChange={setIsConfirming}
        title={`Delete ${habit.name}?`}
        description={`This removes the habit, all ${habit.check_ins.length} logged days, and its goals. This cannot be undone.`}
        confirmLabel="Delete habit"
        isLoading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true)
          const ok = await removeHabit(habit.id)
          setIsDeleting(false)
          if (ok) router.push('/habits')
        }}
      />
    </div>
  )
}
