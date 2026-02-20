'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from './types'
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<UserRole>
  signup: (
    email: string,
    password: string,
    name: string,
    role: Exclude<UserRole, 'admin'>,
  ) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSupabaseUser(supabaseUser: SupabaseUser, profile?: any): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : supabaseUser.user_metadata?.first_name
        ? `${supabaseUser.user_metadata.first_name} ${supabaseUser.user_metadata.last_name || ''}`.trim()
        : supabaseUser.email || '',
    role: (profile?.role as UserRole) || 'attendee',
    avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      const mappedUser = mapSupabaseUser(supabaseUser, profile)
      setUser(mappedUser)
      return mappedUser
    } catch {
      // If profile fetch fails, fall back to user metadata
      const mappedUser = mapSupabaseUser(supabaseUser)
      setUser(mappedUser)
      return mappedUser
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        if (supabaseUser) {
          await fetchProfile(supabaseUser)
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const login = async (email: string, password: string): Promise<UserRole> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const normalized = (error.message || '').toLowerCase()
        if (
          normalized.includes('invalid login credentials') ||
          normalized.includes('invalid email or password')
        ) {
          throw new Error('No account found for this email. Please create an account.')
        }
        throw new Error(error.message)
      }

      if (data.user) {
        const mappedUser = await fetchProfile(data.user)
        return mappedUser.role
      }
      return 'attendee'
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: Exclude<UserRole, 'admin'>,
  ) => {
    setIsLoading(true)
    try {
      const [firstName, ...lastNameParts] = name.split(' ')
      const lastName = lastNameParts.join(' ')

      console.log('[Auth] Attempting signup for:', email, 'with Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30))

      const sanitizedRole: Exclude<UserRole, 'admin'> =
        role === 'organizer' ? 'organizer' : 'attendee'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: sanitizedRole,
          },
        },
      })

      if (error) {
        console.error('[Auth] Signup error:', error.message, error)
        throw new Error(error.message)
      }

      console.log('[Auth] Signup success:', data.user?.id)

      if (data.user) {
        await fetchProfile(data.user)
      }
    } catch (err) {
      console.error('[Auth] Signup failed:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    // Optimistic logout for instant UX.
    setUser(null)
    setIsLoading(false)

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.error('[Auth] Sign out failed:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
