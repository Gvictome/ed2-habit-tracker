'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Flame, NotebookPen, Plus, Sparkles, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, EmptyState, Skeleton } from '@/components/ui/misc'
import { ProgressBar, Ring } from '@/components/ui/progress'
import { habitStyle } from '@/lib/colors'
import { cn } from '@/lib/cn'
import { formatLongDate } from '@/lib/dates'
import { entryFor, formatAmount, habitStats, isMeasured, type HabitStats } from '@/lib/habits'
import { nextMilestones } from '@/lib/milestones'
import type { Habit, HabitInput } from '@/lib/types'
import { useData } from './data-provider'
import { EntryDialog } from './entry-dialog'
import { HabitControl } from './habit-control'
import { HabitDialog } from './habit-dialog'
import { useToday } from './use-today'

const STARTERS: HabitInput[] = [
  { name: 'Drink water', icon: '💧', color: 'sky', kind: 'measure', unit: 'glasses', dailyTarget: 8, targetPerWeek: 7, description: '' },
  { name: 'Read', icon: '📚', color: 'violet', kind: 'measure', unit: 'pages', dailyTarget: 20, targetPerWeek: 5, description: '' },
  { name: 'Move', icon: '🏃', color: 'emerald', kind: 'check', unit: '', dailyTarget: null, targetPerWeek: 4, description: '' },
  { name: 'Meditate', icon: '🧘', color: 'amber', kind: 'measure', unit: 'min', dailyTarget: 10, targetPerWeek: 7, description: '' },
]

function greeting(hour: number) {
  if (hour < 5) return 'Up late'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function HabitRow({ habit, stats, day, onOpenEntry }: { habit: Habit; stats: HabitStats; day: string; onOpenEntry: () => void }) {
  const entry = entryFor(habit, day)
  const measured = isMeasured(habit)
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
      style={habitStyle(habit.color)}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 pr-4 shadow-card transition-colors sm:gap-4',
        stats.todayProgress >= 1 && 'bg-(--habit)/[0.04]',
      )}
    >
      <HabitControl habit={habit} day={day} onOpenEntry={onOpenEntry} />
      <Link href={`/habits/${habit.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--habit)/12 text-xl" aria-hidden>
          {habit.icon || habit.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className={cn('block truncate font-semibold', stats.todayProgress >= 1 && 'text-muted line-through decoration-(--habit)/60')}>
            {habit.name}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
            {measured && (
              <span className="tabular font-semibold text-(--habit)">
                {formatAmount(Number(entry?.value ?? 0))} / {formatAmount(Number(habit.daily_target ?? 0), habit.unit)}
              </span>
            )}
            <span className="tabular">
              {stats.thisWeek}/{habit.target_per_week} this week
            </span>
            {entry?.note && <span className="hidden truncate italic sm:inline">&ldquo;{entry.note}&rdquo;</span>}
          </span>
        </span>
      </Link>
      {stats.streak > 0 && (
        <span className="tabular flex items-center gap-1 rounded-full bg-orange-500/12 px-2 py-1 text-xs font-bold text-orange-500" title={`${stats.streak}-day streak`}>
          <Flame className="size-3.5" /> {stats.streak}
        </span>
      )}
      <button
        type="button"
        onClick={onOpenEntry}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        aria-label={`Log details for ${habit.name}`}
      >
        <NotebookPen className="size-4" />
      </button>
    </motion.li>
  )
}

function TodaySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-44 rounded-3xl" />
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-[68px] rounded-2xl" />
      ))}
    </div>
  )
}

export function TodayView() {
  const { habits, profile, addHabit } = useData()
  const { key: day, now } = useToday()
  const [isCreating, setIsCreating] = useState(false)
  const [entryHabitId, setEntryHabitId] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('welcome')) toast.success('Welcome to Streakly', { description: 'Add a habit to get started.' })
    if (searchParams.get('reset')) toast.success('Password updated')
    if (searchParams.get('welcome') || searchParams.get('reset')) router.replace('/today')
  }, [searchParams, router])

  const rows = useMemo(
    () => (now ? habits.map((habit) => ({ habit, stats: habitStats(habit, now) })) : []),
    [habits, now],
  )
  const upNext = useMemo(() => nextMilestones(habits, 1)[0], [habits])

  if (!day || !now) return <TodaySkeleton />

  const done = rows.filter((row) => row.stats.todayProgress >= 1)
  const pending = rows.filter((row) => row.stats.todayProgress < 1)
  const ratio = rows.length > 0 ? done.length / rows.length : 0
  const leader = rows.reduce<(typeof rows)[number] | null>((best, row) => (!best || row.stats.streak > best.stats.streak ? row : best), null)
  const firstName = profile.display_name.split(' ')[0]
  const entryHabit = habits.find((habit) => habit.id === entryHabitId) ?? null

  async function seedStarter(input: HabitInput) {
    setIsSeeding(true)
    await addHabit(input)
    setIsSeeding(false)
  }

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">{formatLongDate(now)}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {greeting(new Date().getHours())}
            {firstName ? `, ${firstName}` : ''}
          </h1>
        </div>
        <Button onClick={() => setIsCreating(true)} className="hidden sm:inline-flex">
          <Plus /> New habit
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Sparkles />}
          title="Start with one small habit"
          description="Pick a starter below or make your own. You can log amounts, set goals, and earn milestones as you go."
          action={
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((starter) => (
                  <Button key={starter.name} variant="secondary" size="sm" disabled={isSeeding} onClick={() => seedStarter(starter)}>
                    <span aria-hidden>{starter.icon}</span> {starter.name}
                  </Button>
                ))}
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus /> Create my own
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <Card className="relative mb-6 overflow-hidden p-5 sm:p-6">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <Ring value={ratio} size={124} stroke={11} color="var(--accent)" label={`${done.length} of ${rows.length} habits done today`}>
                <div className="text-center">
                  <p className="tabular font-display text-3xl font-bold">{Math.round(ratio * 100)}%</p>
                  <p className="text-[11px] font-semibold text-muted">today</p>
                </div>
              </Ring>
              <div className="flex-1">
                <p className="font-display text-xl font-semibold">
                  {ratio === 1 ? 'Everything done. Nice work.' : `${done.length} of ${rows.length} done`}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {ratio === 1
                    ? 'Your streaks are safe for today.'
                    : `${pending.length} left to keep your streaks going.`}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-surface-2/60 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <Flame className="size-3.5 text-orange-500" /> Longest live streak
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {leader && leader.stats.streak > 0 ? (
                        <>
                          <span className="tabular font-display text-lg">{leader.stats.streak}d</span>{' '}
                          <span className="text-muted">{leader.habit.name}</span>
                        </>
                      ) : (
                        <span className="text-muted">Check something off</span>
                      )}
                    </p>
                  </div>
                  <Link href="/insights" className="rounded-2xl border border-border bg-surface-2/60 p-3 transition-colors hover:border-border-strong">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <Trophy className="size-3.5 text-amber-500" /> Next milestone
                    </p>
                    {upNext ? (
                      <>
                        <p className="mt-1 truncate text-sm font-semibold">{upNext.title}</p>
                        <ProgressBar value={upNext.progress} className="mt-2 h-1.5" color="var(--accent)" label="Milestone progress" />
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted">All earned</p>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <section aria-labelledby="todo-heading">
            <h2 id="todo-heading" className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
              To do · {pending.length}
            </h2>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {pending.map(({ habit, stats }) => (
                  <HabitRow key={habit.id} habit={habit} stats={stats} day={day} onOpenEntry={() => setEntryHabitId(habit.id)} />
                ))}
              </AnimatePresence>
              {pending.length === 0 && (
                <li className="rounded-2xl border border-dashed border-border-strong p-4 text-center text-sm text-muted">
                  Nothing left for today 🎉
                </li>
              )}
            </ul>
          </section>

          {done.length > 0 && (
            <section aria-labelledby="done-heading" className="mt-8">
              <h2 id="done-heading" className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
                Done · {done.length}
              </h2>
              <ul className="flex flex-col gap-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {done.map(({ habit, stats }) => (
                    <HabitRow key={habit.id} habit={habit} stats={stats} day={day} onOpenEntry={() => setEntryHabitId(habit.id)} />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className="fixed right-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-2xl bg-accent text-accent-fg shadow-[0_12px_30px_-8px_var(--ring)] transition-transform active:scale-95 sm:hidden"
        aria-label="New habit"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>

      <HabitDialog open={isCreating} onOpenChange={setIsCreating} />
      <EntryDialog habit={entryHabit} day={entryHabit ? day : null} onOpenChange={(open) => !open && setEntryHabitId(null)} />
    </>
  )
}
