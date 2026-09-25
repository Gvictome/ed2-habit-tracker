'use client'

import { Check, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field, Textarea } from '@/components/ui/field'
import { Ring } from '@/components/ui/progress'
import { habitStyle } from '@/lib/colors'
import { cn } from '@/lib/cn'
import { formatLongDate, parseDayKey } from '@/lib/dates'
import { entryFor, formatAmount, isMeasured } from '@/lib/habits'
import type { Habit } from '@/lib/types'
import { useData } from './data-provider'

interface EntryDialogProps {
  habit: Habit | null
  day: string | null
  onOpenChange: (open: boolean) => void
}

/** Log or edit one day of one habit: an amount for measured habits, a note for any. */
export function EntryDialog({ habit, day, onOpenChange }: EntryDialogProps) {
  const open = Boolean(habit && day)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {habit && day && (
        <DialogContent
          title={`${habit.icon ? `${habit.icon} ` : ''}${habit.name}`}
          description={formatLongDate(parseDayKey(day))}
        >
          <EntryForm key={`${habit.id}-${day}`} habit={habit} day={day} onDone={() => onOpenChange(false)} />
        </DialogContent>
      )}
    </Dialog>
  )
}

/** A step that feels natural for the target: 1 glass, 5 minutes, 500 steps. */
function stepFor(target: number): number {
  if (target <= 20) return 1
  if (target <= 120) return 5
  if (target <= 2000) return 50
  return 500
}

function EntryForm({ habit, day, onDone }: { habit: Habit; day: string; onDone: () => void }) {
  const { saveEntry, clearEntry } = useData()
  const existing = entryFor(habit, day)
  const measured = isMeasured(habit)
  const target = Number(habit.daily_target ?? 0)
  const step = stepFor(target)

  const [value, setValue] = useState<number>(existing?.value ?? 0)
  const [isDone, setIsDone] = useState<boolean>(Boolean(existing))
  const [note, setNote] = useState(existing?.note ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const adjust = (delta: number) => setValue((current) => Math.max(0, Math.round((current + delta) * 100) / 100))

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    const isEmpty = measured ? value <= 0 && !note.trim() : !isDone && !note.trim()
    const ok = isEmpty
      ? existing
        ? await clearEntry(habit.id, day)
        : true
      : await saveEntry(habit.id, day, { value: measured ? value : null, note })
    setIsSaving(false)
    if (ok) onDone()
  }

  async function handleClear() {
    setIsSaving(true)
    const ok = await clearEntry(habit.id, day)
    setIsSaving(false)
    if (ok) onDone()
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5" style={habitStyle(habit.color)}>
      {measured ? (
        <div className="flex flex-col items-center gap-4">
          <Ring value={target > 0 ? value / target : 0} size={148} stroke={12} label={`${value} of ${target} ${habit.unit}`}>
            <div className="text-center">
              <p className="tabular font-display text-4xl font-bold">{Math.round(value * 100) / 100}</p>
              <p className="text-xs text-muted">of {formatAmount(target, habit.unit)}</p>
            </div>
          </Ring>
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" size="icon" onClick={() => adjust(-step)} aria-label={`Remove ${step}`}>
              <Minus />
            </Button>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={value}
              onChange={(event) => setValue(Math.max(0, Number(event.target.value) || 0))}
              className="tabular h-12 w-28 rounded-xl border border-border bg-surface-2 text-center font-display text-xl font-bold outline-none focus:border-(--habit)"
              aria-label={`Amount in ${habit.unit}`}
            />
            <Button type="button" variant="secondary" size="icon" onClick={() => adjust(step)} aria-label={`Add ${step}`}>
              <Plus />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[step, step * 2, step * 5].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => adjust(amount)}
                className="tabular h-8 rounded-full border border-border bg-surface-2 px-3 text-xs font-semibold text-muted hover:text-foreground"
              >
                +{amount}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setValue(Math.max(value, target))}
              className="h-8 rounded-full bg-(--habit)/15 px-3 text-xs font-semibold text-(--habit)"
            >
              Hit target
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsDone((current) => !current)}
          aria-pressed={isDone}
          className={cn(
            'flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors',
            isDone ? 'border-(--habit)/40 bg-(--habit)/10' : 'border-border bg-surface-2/60',
          )}
        >
          <span
            className={cn(
              'grid size-11 place-items-center rounded-full border-2 transition-all',
              isDone ? 'border-(--habit) bg-(--habit) text-white' : 'border-border-strong',
            )}
          >
            {isDone && <Check className="size-5" strokeWidth={3} />}
          </span>
          <span>
            <span className="block font-semibold">{isDone ? 'Done' : 'Not done'}</span>
            <span className="text-xs text-muted">Tap to {isDone ? 'undo' : 'mark this day done'}</span>
          </span>
        </button>
      )}

      <Field label="Note" hint="How did it go? Only you can see this.">
        {(id, describedBy) => (
          <Textarea
            id={id}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={280}
            placeholder="Felt easy today."
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <div className="flex gap-2">
        {existing && (
          <Button type="button" variant="danger-ghost" onClick={handleClear} disabled={isSaving}>
            <Trash2 /> Clear day
          </Button>
        )}
        <Button type="submit" className="flex-1" isLoading={isSaving}>
          Save
        </Button>
      </div>
    </form>
  )
}
