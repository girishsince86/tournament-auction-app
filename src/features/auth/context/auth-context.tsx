'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/types/supabase'

// Initialize Supabase client outside component
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Validate user authentication
  const validateUser = async (source: string) => {
    console.log(`[Auth Validation] Validating user from: ${source}`)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error(`[Auth Validation] Error validating user from ${source}:`, error)
      return null
    }
    
    if (user) {
      console.log(`[Auth Validation] Valid user confirmed from ${source}:`, {
        id: user.id,
        email: user.email,
        lastSignIn: user.last_sign_in_at,
      })
    } else {
      console.log(`[Auth Validation] No valid user found from ${source}`)
    }
    
    return user
  }

  useEffect(() => {
    const getAuthenticatedUser = async () => {
      try {
        const validatedUser = await validateUser('initial mount')
        if (!validatedUser) {
          setUser(null)
          router.push('/login')
        } else {
          setUser(validatedUser)
        }
      } catch (error) {
        console.error('[Auth Error] Initial authentication error:', error)
        setUser(null)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    // Get authenticated user on mount
    getAuthenticatedUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log(`[Auth Event] Auth state changed: ${event}`)
      
      // Always verify the user with getUser() on auth state changes
      const validatedUser = await validateUser('auth state change')
      
      if (!validatedUser) {
        setUser(null)
        router.push('/login')
      } else {
        setUser(validatedUser)
        
        // Only refresh and redirect on specific auth events
        if (event === 'SIGNED_IN') {
          console.log('[Auth Event] User signed in, refreshing and redirecting')
          router.refresh()
          router.push('/registration-summary')
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth Event] User signed out, refreshing and redirecting')
          router.refresh()
          router.push('/login')
        }
      }
      
      setIsLoading(false)
    })

    return () => {
      console.log('[Auth Cleanup] Unsubscribing from auth state changes')
      subscription.unsubscribe()
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('[Auth Action] Attempting sign in')
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      // Validate user after sign in
      await validateUser('post sign in')
    } catch (error) {
      console.error('[Auth Error] Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('[Auth Action] Attempting sign up')
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      
      // Validate user after sign up
      await validateUser('post sign up')
    } catch (error) {
      console.error('[Auth Error] Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      console.log('[Auth Action] Attempting sign out')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Validate that user is actually signed out
      const validatedUser = await validateUser('post sign out')
      if (validatedUser) {
        console.warn('[Auth Warning] User still validated after sign out')
      }
    } catch (error) {
      console.error('[Auth Error] Sign out error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 