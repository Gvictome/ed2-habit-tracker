import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { SetupNotice } from './components/SetupNotice'
import { Spinner } from './components/Spinner'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { isSupabaseConfigured } from './lib/supabaseClient'

/**
 * The whole app is two screens, so a router would be more ceremony than it is
 * worth: signed-out users get the auth screen, signed-in users get their habits.
 */
function CurrentScreen() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner label="Restoring your session" />
  return user ? <Dashboard /> : <AuthScreen />
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <AuthProvider>
      <CurrentScreen />
    </AuthProvider>
  )
}
