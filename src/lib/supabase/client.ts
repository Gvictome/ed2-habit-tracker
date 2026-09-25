'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

let browserClient: SupabaseClient | null = null

/**
 * One browser client for the whole tab. The session lives in cookies (not
 * localStorage), so the server sees the same signed-in user on every request.
 */
export function getBrowserClient() {
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return browserClient
}
