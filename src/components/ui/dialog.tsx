'use client'

import { AlertDialog, Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'

/*
 * Radix handles focus trapping, Escape to close, scroll locking, and aria
 * wiring. On phones the dialog becomes a bottom sheet.
 */

const OVERLAY = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-overlay-in'

const PANEL =
  'animate-sheet-in fixed z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden border border-border-strong bg-surface shadow-2xl outline-none ' +
  'inset-x-0 bottom-0 rounded-t-3xl pb-[env(safe-area-inset-bottom)] ' +
  'sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:pb-0'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

interface DialogContentProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function DialogContent({ title, description, children, className }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={OVERLAY} />
      <DialogPrimitive.Content className={cn(PANEL, className)}>
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 pt-6 pb-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="font-display text-lg font-semibold tracking-tight">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close">
              <X />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  isLoading?: boolean
  children?: React.ReactNode
  confirmDisabled?: boolean
}

/** For destructive actions: focus starts on Cancel, and Escape backs out. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isLoading,
  children,
  confirmDisabled,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={OVERLAY} />
        <AlertDialog.Content className={cn(PANEL, 'gap-4 p-6 sm:max-w-md')}>
          <AlertDialog.Title className="font-display text-lg font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm leading-relaxed text-muted">
            {description}
          </AlertDialog.Description>
          {children}
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">Cancel</Button>
            </AlertDialog.Cancel>
            <Button
              variant="danger"
              isLoading={isLoading}
              disabled={confirmDisabled}
              onClick={(event) => {
                event.preventDefault()
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
