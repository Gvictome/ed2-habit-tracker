import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/env'

/**
 * Runs before every page request (Next.js 16 renamed Middleware to Proxy).
 *
 * 1. Refreshes the Supabase session so the auth cookie never goes stale -
 *    this is what keeps a user signed in across days and tabs.
 * 2. Sends signed-out visitors away from app pages, and signed-in users away
 *    from the login and signup screens.
 */

const APP_PREFIXES = ['/today', '/habits', '/goals', '/insights', '/settings']
const GUEST_ONLY = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!isSupabaseConfigured) return response

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // getUser() revalidates the token with Supabase; do not trust getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAppRoute = APP_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isGuestOnly = GUEST_ONLY.some((prefix) => pathname.startsWith(prefix))

  if (!user && isAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isGuestOnly) {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Skip static files and images; everything else gets a fresh session.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
