'use client'

import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

const CONTROL =
  'w-full rounded-xl border border-border bg-surface-2/60 px-3.5 text-sm text-foreground placeholder:text-faint ' +
  'transition-colors outline-none hover:border-border-strong focus:border-accent-text/60 focus:bg-surface ' +
  'focus:ring-4 focus:ring-(--ring)/20 disabled:opacity-60 aria-invalid:border-danger/70'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'min-h-20 resize-none py-2.5 leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(CONTROL, 'h-11 appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  )
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-[13px] font-semibold text-foreground', className)} {...props} />
}

interface FieldProps {
  label: string
  hint?: React.ReactNode
  error?: string | null
  className?: string
  /** Receives the generated id so the control and label stay linked. */
  children: (id: string, describedBy: string | undefined) => React.ReactNode
}

/** Label + control + hint/error, wired together with ids for screen readers. */
export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const describedBy = error || hint ? hintId : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children(id, describedBy)}
      {(error || hint) && (
        <p id={hintId} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
