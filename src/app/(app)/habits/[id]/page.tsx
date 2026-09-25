import type { Metadata } from 'next'
import { HabitDetailView } from '@/components/app/habit-detail-view'

export const metadata: Metadata = { title: 'Habit' }

export default async function HabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <HabitDetailView habitId={id} />
}
