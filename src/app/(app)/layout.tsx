import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app/app-shell'
import { DataProvider } from '@/components/app/data-provider'
import { SetupNotice } from '@/components/app/setup-notice'
import { GOAL_COLUMNS, HABIT_COLUMNS, PROFILE_COLUMNS } from '@/lib/queries'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getServerClient } from '@/lib/supabase/server'
import type { Goal, Habit, Profile } from '@/lib/types'

/**
 * Server Component gate for every signed-in page.
 *
 * The proxy already redirects signed-out visitors; checking again here means
 * no page can render user data even if the proxy matcher misses a path. The
 * first data snapshot is fetched on the server with the user's own cookie, so
 * Row Level Security applies exactly as it does in the browser.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice kind="env" />

  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [habitResult, goalResult, profileResult] = await Promise.all([
    supabase.from('habits').select(HABIT_COLUMNS).eq('user_id', user.id).order('created_at').returns<Habit[]>(),
    supabase.from('goals').select(GOAL_COLUMNS).eq('user_id', user.id).order('created_at', { ascending: false }).returns<Goal[]>(),
    supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle<Profile>(),
  ])

  if (habitResult.error || goalResult.error || profileResult.error) {
    const message = habitResult.error?.message ?? goalResult.error?.message ?? profileResult.error?.message
    return <SetupNotice kind="migration" detail={message} />
  }

  const metaName = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : ''
  const profile: Profile = profileResult.data ?? {
    id: user.id,
    display_name: metaName,
    theme: 'system',
    week_start: 1,
  }

  return (
    <DataProvider
      user={{ id: user.id, email: user.email ?? '' }}
      initialProfile={profile}
      initialHabits={habitResult.data ?? []}
      initialGoals={goalResult.data ?? []}
    >
      <AppShell>{children}</AppShell>
    </DataProvider>
  )
}
