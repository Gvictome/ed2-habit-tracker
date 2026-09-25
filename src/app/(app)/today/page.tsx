import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TodayView } from '@/components/app/today-view'

export const metadata: Metadata = { title: 'Today' }

export default function TodayPage() {
  // useSearchParams (welcome / reset toasts) needs a Suspense boundary.
  return (
    <Suspense>
      <TodayView />
    </Suspense>
  )
}
