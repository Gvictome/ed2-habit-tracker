/**
 * Both values are public by design: the anon key only grants what the Row
 * Level Security policies allow. NEXT_PUBLIC_ inlines them at build time, so
 * they must be set in Netlify BEFORE the build runs.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
