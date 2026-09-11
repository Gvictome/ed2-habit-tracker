import { createContext } from 'react'

/**
 * Holds the current Supabase session plus the three auth actions the UI needs.
 * Kept in its own module so component files only export components, which is
 * what the react/only-export-components lint rule expects.
 */
export const AuthContext = createContext(null)
