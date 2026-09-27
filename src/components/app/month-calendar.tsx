'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { shiftDays, startOfWeek, toDayKey } from '@/lib/dates'
import { dayProgress, entryFor } from '@/lib/habits'
import type { Habit } from '@/lib/types'

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const WEEKDAYS_MON = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEKDAYS_SUN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface MonthCalendarProps {
  habit: Habit
  todayKey: string
  weekStart: 0 | 1
  onSelectDay: (day: string) => void
}

/** A month of one habit. Past days open the log dialog; future days are disabled. */
export function MonthCalendar({ habit, todayKey, weekStart, onSelectDay }: MonthCalendarProps) {
  const [offset, setOffset] = useState(0)
  const today = useMemo(() => {
    const [y, m, d] = todayKey.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [todayKey])
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const createdKey = toDayKey(new Date(habit.created_at))

  const cells = useMemo(() => {
    const first = startOfWeek(month, weekStart)
    return Array.from({ length: 42 }, (_, index) => shiftDays(first, index))
    // month is derived from offset + today
  }, [offset, today, weekStart]) // oxlint-disable-line react-hooks/exhaustive-deps

  const lastRowNeeded = cells.slice(35).some((date) => date.getMonth() === month.getMonth())
  const visible = lastRowNeeded ? cells : cells.slice(0, 35)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display font-semibold">{MONTH.format(month)}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setOffset((value) => value - 1)} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setOffset((value) => value + 1)} disabled={offset >= 0} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-faint">
        {(weekStart === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN).map((label, index) => (
          <span key={index} className="pb-1">
            {label}
          </span>
        ))}
        {visible.map((date) => {
          const key = toDayKey(date)
          const inMonth = date.getMonth() === month.getMonth()
          const isFuture = key > todayKey
          const progress = dayProgress(habit, key)
          const entry = entryFor(habit, key)
          const isBeforeHabit = key < createdKey
          return (
            <button
              key={key}
              type="button"
              disabled={isFuture}
              onClick={() => onSelectDay(key)}
              aria-label={`${key}${progress >= 1 ? ', done' : progress > 0 ? ', partly done' : ''}${entry?.note ? ', has a note' : ''}`}
              className={cn(
                'tabular relative grid aspect-square place-items-center rounded-xl text-xs font-semibold transition-all',
                !inMonth && 'opacity-30',
                isFuture && 'cursor-default text-faint/60',
                !isFuture && progress === 0 && 'bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground',
                !isFuture && progress > 0 && progress < 1 && 'bg-(--habit)/25 text-foreground',
                progress >= 1 && 'bg-(--habit) text-white shadow-[0_4px_12px_-4px_var(--habit)]',
                isBeforeHabit && progress === 0 && !isFuture && 'bg-transparent',
                key === todayKey && 'ring-2 ring-foreground/70 ring-offset-2 ring-offset-surface',
              )}
            >
              {date.getDate()}
              {entry?.note && <span className="absolute right-1.5 bottom-1.5 size-1 rounded-full bg-current opacity-80" aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
