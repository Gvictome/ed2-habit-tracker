import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/auth-forms'
import { getServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'New password' }

/** Reached from the reset email via /auth/callback, which has already signed the user in. */
export default async function ResetPasswordPage() {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/forgot-password')
  return <ResetPasswordForm />
}
