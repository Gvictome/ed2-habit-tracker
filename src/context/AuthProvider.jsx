import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './authContext'

/**
 * Subscribes to Supabase auth state and exposes it to the whole tree.
 *
 * Supabase persists the session in localStorage, so on a page refresh we read
 * it back with getSession() before rendering anything that depends on a user.
 *
 * App only mounts this provider once credentials are present, so the client is
 * always available here.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return
      setSession(data.session ?? null)
      setIsLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return
      setSession(nextSession ?? null)
      setIsLoading(false)
    })

    return () => {
      isActive = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signUp: (email, password) => supabase.auth.signUp({ email, password }),
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      signOut: () => supabase.auth.signOut(),
    }),
    [session, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
