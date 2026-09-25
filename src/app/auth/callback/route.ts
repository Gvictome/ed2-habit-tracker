import { NextResponse, type NextRequest } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'

/**
 * Landing point for links in Supabase emails (confirm signup, reset password).
 * Trades the one-time code for a session cookie, then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/today'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/today'

  if (code) {
    const supabase = await getServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=link`)
}
