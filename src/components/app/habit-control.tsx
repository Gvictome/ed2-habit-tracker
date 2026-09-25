'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus } from 'lucide-react'
import { Ring } from '@/components/ui/progress'
import { cn } from '@/lib/cn'
import { dayProgress, entryFor, isMeasured } from '@/lib/habits'
import type { Habit } from '@/lib/types'
import { useData } from './data-provider'

/** Quick-add size for a measured habit: a quarter of the target, at least 1. */
export function quickStep(habit: Habit): number {
  const target = Number(habit.daily_target ?? 1)
  if (target <= 12) return 1
  return Math.max(1, Math.round(target / 4))
}

interface HabitControlProps {
  habit: Habit
  day: string
  /** Opens the full log dialog (used when a measured habit is already at target). */
  onOpenEntry: () => void
  size?: 'md' | 'lg'
}

/**
 * The one-tap control on a habit row.
 * Check habits: toggles done. Measured habits: adds a quick step toward the target.
 */
export function HabitControl({ habit, day, onOpenEntry, size = 'md' }: HabitControlProps) {
  const { toggleCheck, saveEntry } = useData()
  const dimension = size === 'lg' ? 52 : 44
  const progress = dayProgress(habit, day)
  const isDone = progress >= 1

  if (isMeasured(habit)) {
    const entry = entryFor(habit, day)
    const step = quickStep(habit)
    return (
      <button
        type="button"
        onClick={() =>
          isDone
            ? onOpenEntry()
            : saveEntry(habit.id, day, { value: Number(entry?.value ?? 0) + step, note: entry?.note ?? '' })
        }
        className="group relative shrink-0 rounded-full transition-transform active:scale-90"
        aria-label={isDone ? `${habit.name} target reached. Edit amount` : `Add ${step} ${habit.unit} to ${habit.name}`}
      >
        <Ring value={progress} size={dimension} stroke={4}>
          <AnimatePresence mode="wait" initial={false}>
            {isDone ? (
              <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="grid size-full place-items-center rounded-full bg-(--habit) text-white" style={{ width: dimension - 10, height: dimension - 10 }}>
                <Check className="size-5" strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex flex-col items-center leading-none text-(--habit)">
                <Plus className="size-4" strokeWidth={3} />
                <span className="tabular text-[9px] font-bold">{step}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Ring>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => toggleCheck(habit.id, day)}
      aria-pressed={isDone}
      aria-label={isDone ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full border-2 transition-all duration-200 active:scale-90',
        isDone
          ? 'border-(--habit) bg-(--habit) text-white shadow-[0_6px_18px_-6px_var(--habit)]'
          : 'border-border-strong hover:border-(--habit) hover:bg-(--habit)/10',
      )}
      style={{ width: dimension, height: dimension }}
    >
      <AnimatePresence initial={false}>
        {isDone && (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
          >
            <Check className="size-5" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
