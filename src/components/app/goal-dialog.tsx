'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/field'
import { Segmented } from '@/components/ui/segmented'
import { addDaysToKey, todayKey } from '@/lib/dates'
import { GOAL_KIND_LABELS, goalKindsFor } from '@/lib/goals'
import type { Goal, GoalInput, GoalKind, Habit } from '@/lib/types'
import { useData } from './data-provider'

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
  /** Pre-selects a habit (from a habit's own page). */
  habitId?: string
}

export function GoalDialog({ open, onOpenChange, goal, habitId }: GoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={goal ? 'Edit goal' : 'Set a goal'}
        description="Progress counts from the day the goal is set."
      >
        {open && <GoalForm key={goal?.id ?? habitId ?? 'new'} goal={goal} habitId={habitId} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function suggestTitle(habit: Habit | undefined, kind: GoalKind, target: number): string {
  if (!habit) return ''
  if (kind === 'streak') return `${target}-day ${habit.name.toLowerCase()} streak`
  if (kind === 'total_amount') return `${target} ${habit.unit} of ${habit.name.toLowerCase()}`
  return `${habit.name} ${target} times`
}

const DEFAULT_TARGET: Record<GoalKind, number> = { total_days: 30, total_amount: 100, streak: 14 }

function GoalForm({ goal, habitId, onDone }: { goal?: Goal; habitId?: string; onDone: () => void }) {
  const { habits, addGoal, editGoal } = useData()
  const [input, setInput] = useState<GoalInput>(() => ({
    habitId: goal?.habit_id ?? habitId ?? habits[0]?.id ?? '',
    title: goal?.title ?? '',
    kind: goal?.kind ?? 'total_days',
    target: goal?.target ?? DEFAULT_TARGET.total_days,
    deadline: goal?.deadline ?? null,
  }))
  const [titleTouched, setTitleTouched] = useState(Boolean(goal))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const habit = habits.find((item) => item.id === input.habitId)
  const kinds = useMemo(() => (habit ? goalKindsFor(habit) : (['total_days', 'streak'] as GoalKind[])), [habit])
  const title = titleTouched ? input.title : suggestTitle(habit, input.kind, input.target)
  const minDeadline = addDaysToKey(todayKey(), 1)

  const update = <K extends keyof GoalInput>(key: K, value: GoalInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }))

  function changeKind(kind: GoalKind) {
    setInput((current) => ({ ...current, kind, target: DEFAULT_TARGET[kind] }))
  }

  function changeHabit(nextId: string) {
    const next = habits.find((item) => item.id === nextId)
    setInput((current) => ({
      ...current,
      habitId: nextId,
      // A check habit has no amounts to total.
      kind: next && !goalKindsFor(next).includes(current.kind) ? 'total_days' : current.kind,
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!input.habitId) return setError('Pick a habit first.')
    if (!title.trim()) return setError('Give the goal a name.')
    if (!(input.target > 0)) return setError('The target has to be above zero.')
    if (input.deadline && input.deadline < todayKey()) return setError('Pick a deadline in the future.')
    setError(null)
    setIsSaving(true)
    const payload = { ...input, title }
    const ok = goal ? await editGoal(goal.id, payload) : await addGoal(payload)
    setIsSaving(false)
    if (ok) onDone()
  }

  if (habits.length === 0) {
    return <p className="text-sm text-muted">Create a habit first, then set a goal for it.</p>
  }

  const unitLabel = input.kind === 'total_amount' ? habit?.unit || 'amount' : 'days'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field label="Habit">
        {(id) => (
          <Select id={id} value={input.habitId} onChange={(event) => changeHabit(event.target.value)}>
            {habits.map((item) => (
              <option key={item.id} value={item.id}>
                {item.icon ? `${item.icon} ` : ''}
                {item.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Goal type</span>
        <Segmented<GoalKind>
          label="Goal type"
          value={input.kind}
          onChange={changeKind}
          options={kinds.map((kind) => ({ value: kind, label: GOAL_KIND_LABELS[kind] }))}
          className="w-full"
        />
        <p className="text-xs text-muted">
          {input.kind === 'total_days' && 'Count every completed day until you hit the number.'}
          {input.kind === 'total_amount' && `Add up every ${habit?.unit || 'amount'} you log, even on short days.`}
          {input.kind === 'streak' && 'Reach this many completed days in a row.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={`Target (${unitLabel})`}>
          {(id) => (
            <Input
              id={id}
              type="number"
              inputMode="decimal"
              min={1}
              step="any"
              value={Number.isFinite(input.target) ? input.target : ''}
              onChange={(event) => update('target', Number(event.target.value))}
            />
          )}
        </Field>
        <Field label="Deadline" hint="Optional">
          {(id, describedBy) => (
            <Input
              id={id}
              type="date"
              min={minDeadline}
              value={input.deadline ?? ''}
              onChange={(event) => update('deadline', event.target.value || null)}
              aria-describedby={describedBy}
            />
          )}
        </Field>
      </div>

      <Field label="Goal name" error={error}>
        {(id, describedBy) => (
          <Input
            id={id}
            value={title}
            maxLength={80}
            onChange={(event) => {
              setTitleTouched(true)
              update('title', event.target.value)
            }}
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <Button type="submit" size="lg" isLoading={isSaving} className="w-full">
        {goal ? 'Save goal' : 'Set goal'}
      </Button>
    </form>
  )
}
