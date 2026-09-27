'use client'

import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Catches a render error in any app page without taking down the sidebar. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/15 text-danger">
        <TriangleAlert className="size-6" />
      </div>
      <h1 className="mt-4 font-display text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        Your data is safe. Try again, and if it keeps happening, refresh the page.
      </p>
      {error.digest && <p className="tabular mt-2 text-xs text-faint">Reference: {error.digest}</p>}
      <Button className="mt-6" onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </div>
  )
}
