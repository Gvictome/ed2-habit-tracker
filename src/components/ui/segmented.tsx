'use client'

import { motion } from 'motion/react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

interface Option<T extends string> {
  value: T
  label: React.ReactNode
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  label: string
  className?: string
}

/** A radio group styled as a pill switcher, with a sliding highlight. */
export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  const layoutId = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-xl border border-border bg-surface-2/70 p-1', className)}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors [&_svg]:size-3.5',
              isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg border border-border-strong bg-surface shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
