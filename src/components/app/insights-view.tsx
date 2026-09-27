'use client'

import { CheckCheck, Flame, Gauge, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Card, Skeleton } from '@/components/ui/misc'
import { ProgressBar } from '@/components/ui/progress'
import { habitStyle } from '@/lib/colors'
import { habitStats } from '@/lib/habits'
import { calculateProgress } from '@/lib/levels'
import { earnedMilestones, nextMilestones } from '@/lib/milestones'
import { heatmap } from '@/lib/stats'
import { Heatmap, StatTile } from './charts'
import { useData } from './data-provider'
import { MilestoneProgressList, MilestoneTimeline } from './milestone-list'
import { PageHeader } from './page-header'
import { useToday } from './use-today'

export function InsightsView() {
  const { habits, profile } = useData()
  const { now } = useToday()

  const data = useMemo(() => {
    if (!now) return null
    const perHabit = habits.map((habit) => ({ habit, stats: habitStats(habit, now) }))
    const avgRate = perHabit.length ? perHabit.reduce((sum, row) => sum + row.stats.completionRate, 0) / perHabit.length : 0
    return {
      level: calculateProgress(habits, now),
      weeks: heatmap(habits, 17, profile.week_start, now),
      perHabit: [...perHabit].sort((a, b) => b.stats.completionRate - a.stats.completionRate),
      avgRate,
      bestStreak: Math.max(0, ...perHabit.map((row) => row.stats.bestStreak)),
      earned: earnedMilestones(habits),
      next: nextMilestones(habits, 5),
    }
  }, [habits, now, profile.week_start])

  return (
    <>
      <PageHeader eyebrow="The big picture" title="Insights" description="How consistent you have been, where you are strongest, and what you will unlock next." />

      {!data ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={<Zap className="text-accent-text" />} label="Level" value={data.level.level} hint={data.level.title} />
            <StatTile icon={<CheckCheck />} label="Completed days" value={data.level.totalCheckIns} hint={`${data.level.xp} XP total`} />
            <StatTile icon={<Flame className="text-orange-500" />} label="Best streak" value={`${data.bestStreak}d`} hint="Across all habits" />
            <StatTile icon={<Gauge />} label="Avg 30-day rate" value={`${Math.round(data.avgRate * 100)}%`} hint="Against weekly targets" />
          </div>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">Consistency</h2>
              <p className="text-xs text-muted">Share of habits done each day · last 17 weeks</p>
            </div>
            <Heatmap weeks={data.weeks} weekStart={profile.week_start} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">By habit</h2>
              {data.perHabit.length === 0 ? (
                <p className="text-sm text-muted">Add a habit to see how it compares.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {data.perHabit.map(({ habit, stats }) => (
                    <li key={habit.id} style={habitStyle(habit.color)}>
                      <Link href={`/habits/${habit.id}`} className="group block">
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 font-semibold group-hover:underline">
                            <span aria-hidden>{habit.icon || '•'}</span>
                            <span className="truncate">{habit.name}</span>
                          </span>
                          <span className="tabular shrink-0 text-xs text-muted">
                            {Math.round(stats.completionRate * 100)}% · {stats.streak}d streak
                          </span>
                        </div>
                        <ProgressBar value={stats.completionRate} label={`${habit.name} 30-day completion`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Up next</h2>
              <MilestoneProgressList milestones={data.next} />
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">Milestones</h2>
              <p className="tabular text-xs text-muted">{data.earned.length} earned</p>
            </div>
            <MilestoneTimeline milestones={data.earned.slice(0, 12)} />
          </Card>
        </div>
      )}
    </>
  )
}
