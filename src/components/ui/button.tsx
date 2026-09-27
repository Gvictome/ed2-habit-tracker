import { Slot } from 'radix-ui'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const VARIANTS = {
  primary:
    'bg-accent text-accent-fg shadow-[0_0_0_1px_rgb(0_0_0/0.08)_inset,0_8px_20px_-8px_var(--ring)] hover:brightness-105 active:brightness-95',
  secondary: 'bg-surface-2 text-foreground border border-border hover:bg-surface-3',
  outline: 'border border-border-strong text-foreground hover:bg-surface-2',
  ghost: 'text-muted hover:bg-surface-2 hover:text-foreground',
  danger: 'bg-danger text-white hover:brightness-110',
  'danger-ghost': 'text-danger hover:bg-danger/10',
} as const

const SIZES = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-base',
  icon: 'size-10 rounded-xl',
  'icon-sm': 'size-8 rounded-lg',
} as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  isLoading?: boolean
  /** Render the child element (e.g. a Link) with button styling. */
  asChild?: boolean
}

export function buttonClasses(variant: keyof typeof VARIANTS = 'primary', size: keyof typeof SIZES = 'md') {
  return cn(
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-all duration-150',
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button'
  return (
    <Component
      className={cn(buttonClasses(variant, size), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && <Loader2 className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Component>
  )
}
