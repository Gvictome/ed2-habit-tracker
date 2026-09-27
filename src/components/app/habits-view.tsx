'use client'

import { motion } from 'motion/react'
import { Flame, LayoutGrid, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge, EmptyState, Skeleton } from '@/components/ui/misc'
import { habitStyle } from '@/lib/colors'
import { cn } from '@/lib/cn'
import { recentDays } from '@/lib/dates'
import { dayProgress, formatAmount, habitStats, isMeasured } from '@/lib/habits'
import { isCold } from '@/lib/levels'
import { useData } from './data-provider'
import { HabitDialog } from './habit-dialog'
import { PageHeader } from './page-header'
import { useToday } from './use-today'

export function HabitsView() {
  const { habits } = useData()
  const { now } = useToday()
  const [isCreating, setIsCreating] = useState(false)

  const cards = useMemo(
    () =>
      now
        ? habits.map((habit) => ({
            habit,
            stats: habitStats(habit, now),
            cold: isCold(habit, now),
            days: recentDays(14, now),
          }))
        : [],
    [habits, now],
  )

  return (
    <>
      <PageHeader
        eyebrow={`${habits.length} ${habits.length === 1 ? 'habit' : 'habits'}`}
        title="Habits"
        description="Everything you are building. Open a habit for its full history, goals, and milestones."
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Plus /> New habit
          </Button>
        }
      />

      {!now ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-52 rounded-3xl" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid />}
          title="No habits yet"
          description="Create one to start tracking. Try something you can do in under five minutes."
          action={
            <Button onClick={() => setIsCreating(true)}>
              <Plus /> New habit
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ habit, stats, cold, days }, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Link
                href={`/habits/${habit.id}`}
                style={habitStyle(habit.color)}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-(--habit)/40"
              >
                <div
                  className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-(--habit)/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-(--habit)/12 text-2xl">
                    {habit.icon || habit.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-semibold">{habit.name}</p>
                    <p className="text-xs text-muted">
                      {isMeasured(habit)
                        ? `${formatAmount(Number(habit.daily_target ?? 0), habit.unit)} a day`
                        : 'Done / not done'}
                      {' · '}
                      {habit.target_per_week === 7 ? 'daily' : `${habit.target_per_week}× a week`}
                    </p>
                  </div>
                  {cold && <Badge tone="info">Cold</Badge>}
                </div>

                <div className="relative grid grid-cols-3 gap-2">
                  <div>
                    <p className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                      <Flame className="size-3 text-orange-500" /> Streak
                    </p>
                    <p className="tabular font-display text-xl font-bold">{stats.streak}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted">Best</p>
                    <p className="tabular font-display text-xl font-bold">{stats.bestStreak}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted">30-day rate</p>
                    <p className="tabular font-display text-xl font-bold">{Math.round(stats.completionRate * 100)}%</p>
                  </div>
                </div>

                <div className="relative mt-auto flex gap-1" aria-label="Last 14 days">
                  {days.map((day) => {
                    const progress = dayProgress(habit, day.key)
                    return (
                      <span
                        key={day.key}
                        title={day.key}
                        className={cn(
                          'h-6 flex-1 rounded-md',
                          progress >= 1 ? 'bg-(--habit)' : progress > 0 ? 'bg-(--habit)/35' : 'bg-surface-3',
                          day.isToday && 'ring-1 ring-foreground/50 ring-offset-1 ring-offset-surface',
                        )}
                      />
                    )
                  })}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <HabitDialog open={isCreating} onOpenChange={setIsCreating} />
    </>
  )
}
