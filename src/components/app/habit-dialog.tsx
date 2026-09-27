'use client'

import { CircleCheck, Ruler } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Input, Textarea } from '@/components/ui/field'
import { Segmented } from '@/components/ui/segmented'
import { DEFAULT_COLOR, HABIT_COLORS, ICON_SUGGESTIONS } from '@/lib/colors'
import { cn } from '@/lib/cn'
import type { Habit, HabitInput, HabitKind } from '@/lib/types'
import { useData } from './data-provider'

const UNIT_SUGGESTIONS = ['glasses', 'min', 'pages', 'steps', 'km', 'reps', 'hours']

/**
 * Keeps one emoji. Emoji like ✍️ or 🏃‍♀️ are several code points, so slicing
 * characters would cut them in half; a grapheme segmenter keeps them whole.
 * The database allows up to 8 code points.
 */
function lastGrapheme(value: string): string {
  const segments = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)]
  const last = segments.at(-1)?.segment ?? ''
  return [...last].length <= 8 ? last : ''
}

function initialInput(habit?: Habit): HabitInput {
  return {
    name: habit?.name ?? '',
    description: habit?.description ?? '',
    color: habit?.color ?? DEFAULT_COLOR,
    icon: habit?.icon ?? '',
    kind: habit?.kind ?? 'check',
    unit: habit?.unit ?? '',
    dailyTarget: habit?.daily_target ?? null,
    targetPerWeek: habit?.target_per_week ?? 7,
  }
}

function validate(input: HabitInput): Partial<Record<keyof HabitInput, string>> {
  const errors: Partial<Record<keyof HabitInput, string>> = {}
  if (!input.name.trim()) errors.name = 'Give the habit a name.'
  else if (input.name.trim().length > 80) errors.name = 'Keep it under 80 characters.'
  if (input.description.length > 280) errors.description = 'Keep notes under 280 characters.'
  if (input.kind === 'measure') {
    if (!input.dailyTarget || input.dailyTarget <= 0) errors.dailyTarget = 'Set a daily target above zero.'
    if (!input.unit.trim()) errors.unit = 'What are you measuring? e.g. glasses, minutes.'
    else if (input.unit.trim().length > 16) errors.unit = 'Keep the unit short (16 characters).'
  }
  return errors
}

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit
  onSaved?: (habit: Habit | null) => void
}

export function HabitDialog({ open, onOpenChange, habit, onSaved }: HabitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={habit ? 'Edit habit' : 'New habit'}
        description={habit ? 'Changes apply to your whole history.' : 'Something small you can do on most days.'}
      >
        {/* Keyed so reopening always starts from the habit's saved values. */}
        {open && <HabitForm key={habit?.id ?? 'new'} habit={habit} onDone={(saved) => { onOpenChange(false); onSaved?.(saved) }} />}
      </DialogContent>
    </Dialog>
  )
}

function HabitForm({ habit, onDone }: { habit?: Habit; onDone: (habit: Habit | null) => void }) {
  const { addHabit, editHabit } = useData()
  const [input, setInput] = useState<HabitInput>(() => initialInput(habit))
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({})
  const [isSaving, setIsSaving] = useState(false)

  const update = <K extends keyof HabitInput>(key: K, value: HabitInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const found = validate(input)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setIsSaving(true)
    if (habit) {
      const ok = await editHabit(habit.id, input)
      setIsSaving(false)
      if (ok) onDone(null)
    } else {
      const created = await addHabit(input)
      setIsSaving(false)
      if (created) onDone(created)
    }
  }

  const isMeasure = input.kind === 'measure'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex gap-3">
        <Field label="Icon" className="w-20">
          {(id) => (
            <Input
              id={id}
              value={input.icon}
              onChange={(event) => update('icon', lastGrapheme(event.target.value))}
              placeholder="✨"
              className="text-center text-xl"
              aria-label="Habit icon (emoji)"
            />
          )}
        </Field>
        <Field label="Name" error={errors.name} className="flex-1">
          {(id, describedBy) => (
            <Input
              id={id}
              value={input.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Drink water"
              maxLength={80}
              autoFocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy}
            />
          )}
        </Field>
      </div>

      <div className="-mt-2 flex flex-wrap gap-1.5" aria-label="Icon suggestions">
        {ICON_SUGGESTIONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => update('icon', icon)}
            className={cn(
              'grid size-9 place-items-center rounded-lg border text-lg transition-all hover:scale-110',
              input.icon === icon ? 'border-accent bg-accent/15' : 'border-transparent bg-surface-2',
            )}
            aria-label={`Use ${icon}`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">How do you track it?</span>
        <Segmented<HabitKind>
          label="Habit type"
          value={input.kind}
          onChange={(kind) => update('kind', kind)}
          options={[
            { value: 'check', label: <><CircleCheck /> Done / not done</> },
            { value: 'measure', label: <><Ruler /> Measure an amount</> },
          ]}
          className="w-full"
        />
      </div>

      {isMeasure && (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface-2/50 p-4">
          <Field label="Daily target" error={errors.dailyTarget}>
            {(id, describedBy) => (
              <Input
                id={id}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={input.dailyTarget ?? ''}
                onChange={(event) =>
                  update('dailyTarget', event.target.value === '' ? null : Number(event.target.value))
                }
                placeholder="8"
                aria-invalid={Boolean(errors.dailyTarget)}
                aria-describedby={describedBy}
              />
            )}
          </Field>
          <Field label="Unit" error={errors.unit}>
            {(id, describedBy) => (
              <Input
                id={id}
                value={input.unit}
                onChange={(event) => update('unit', event.target.value)}
                placeholder="glasses"
                maxLength={16}
                list="unit-suggestions"
                aria-invalid={Boolean(errors.unit)}
                aria-describedby={describedBy}
              />
            )}
          </Field>
          <datalist id="unit-suggestions">
            {UNIT_SUGGESTIONS.map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>
          <p className="col-span-2 text-xs text-muted">
            A day counts as done once you log at least the daily target. Smaller amounts still count toward
            totals.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">Weekly target</span>
          <span className="tabular text-sm font-semibold text-accent-text">
            {input.targetPerWeek === 7 ? 'Every day' : `${input.targetPerWeek} days a week`}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5" role="radiogroup" aria-label="Days per week">
          {[1, 2, 3, 4, 5, 6, 7].map((count) => (
            <button
              key={count}
              type="button"
              role="radio"
              aria-checked={input.targetPerWeek === count}
              onClick={() => update('targetPerWeek', count)}
              className={cn(
                'tabular h-10 rounded-xl border text-sm font-bold transition-colors',
                input.targetPerWeek === count
                  ? 'border-accent bg-accent text-accent-fg'
                  : 'border-border bg-surface-2 text-muted hover:text-foreground',
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold">Colour</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
          {HABIT_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={input.color === color.id}
              aria-label={color.label}
              onClick={() => update('color', color.id)}
              className={cn(
                'size-8 rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-110',
                input.color === color.id && 'ring-2 ring-foreground',
              )}
              style={{ background: color.hex }}
            />
          ))}
        </div>
      </div>

      <Field label="Notes" hint="Optional. Why this habit matters to you." error={errors.description}>
        {(id, describedBy) => (
          <Textarea
            id={id}
            value={input.description}
            onChange={(event) => update('description', event.target.value)}
            maxLength={280}
            placeholder="Hydrated brain, better focus."
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <Button type="submit" size="lg" isLoading={isSaving} className="w-full">
        {habit ? 'Save changes' : 'Create habit'}
      </Button>
    </form>
  )
}
