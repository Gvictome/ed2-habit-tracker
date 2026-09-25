'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { parseDayKey, todayKey } from '@/lib/dates'

/*
 * "Today" depends on the viewer's timezone, which the server does not know.
 * Rendering date-based UI on the server would hydrate with the wrong day for
 * anyone not in the server's timezone. So the server snapshot is null, the
 * client fills it in after hydration, and a one-minute tick rolls the app
 * over at midnight without a refresh.
 */

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000)
  window.addEventListener('focus', onChange)
  return () => {
    window.clearInterval(timer)
    window.removeEventListener('focus', onChange)
  }
}

export function useTodayKey(): string | null {
  return useSyncExternalStore(subscribe, () => todayKey(), () => null)
}

/** Today's key plus a Date for it; both null until the client has mounted. */
export function useToday(): { key: string | null; now: Date | null } {
  const key = useTodayKey()
  // A Date pinned to the current day, so memoised stats only recompute when the day changes.
  const now = useMemo(() => (key ? new Date(parseDayKey(key).getTime() + 12 * 3_600_000) : null), [key])
  return { key, now }
}
