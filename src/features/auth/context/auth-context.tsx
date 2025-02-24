'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/types/supabase'
import { toast } from 'react-hot-toast'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

interface AuthUser {
  id: string
  email?: string
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
  raw_app_meta_data?: {
    role?: string
    provider?: string
    providers?: string[]
  }
}

interface AuthContextType {
  user: AuthUser | null
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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Validate user authentication
  const validateUser = async (source: string) => {
    console.log('[Auth Validation] Validating user from:', source, {
      user: user ? {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      } : null
    })
    
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error || !currentUser) {
        console.log('[Auth Validation] No valid user found:', { error })
        setUser(null)
        return null
      }

      console.log('[Auth Validation] Valid user confirmed from', source, {
        id: currentUser.id,
        email: currentUser.email,
        app_metadata: currentUser.app_metadata,
        user_metadata: currentUser.user_metadata
      })
      
      setUser(currentUser)
      return currentUser
    } catch (error) {
      console.error('[Auth Validation] Error validating user:', error)
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    const getAuthenticatedUser = async () => {
      try {
        const validatedUser = await validateUser('initial mount')
        setUser(validatedUser)
        
        // Skip redirection for registration and profile pages
        const isPublicPage = window.location.pathname === '/tournaments/register' || 
                           window.location.pathname.startsWith('/profile/')
        if (!validatedUser && !window.location.pathname.startsWith('/login') && !isPublicPage) {
          router.push('/login')
        }
      } catch (error) {
        console.error('[Auth Error] Initial authentication error:', error)
        setUser(null)
        // Skip redirection for registration and profile pages
        const isPublicPage = window.location.pathname === '/tournaments/register' || 
                           window.location.pathname.startsWith('/profile/')
        if (!window.location.pathname.startsWith('/login') && !isPublicPage) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Get authenticated user on mount
    getAuthenticatedUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth Event] Auth state changed: ${event}`, { session })
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('[Auth Event] User signed out or session ended')
        setUser(null)
        setIsLoading(false)
        // Skip redirection for registration and profile pages
        const isPublicPage = window.location.pathname === '/tournaments/register' || 
                           window.location.pathname.startsWith('/profile/')
        if (!window.location.pathname.startsWith('/login') && !isPublicPage) {
          router.push('/login')
        }
        return
      }
      
      // For other events, verify the user
      const validatedUser = await validateUser('auth state change')
      setUser(validatedUser)
      
      if (event === 'SIGNED_IN' && validatedUser) {
        if (window.location.pathname.startsWith('/login')) {
          router.push('/registration-summary')
        }
      } else if (!validatedUser) {
        // Skip redirection for registration and profile pages
        const isPublicPage = window.location.pathname === '/tournaments/register' || 
                           window.location.pathname.startsWith('/profile/')
        if (!window.location.pathname.startsWith('/login') && !isPublicPage) {
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
      const validatedUser = await validateUser('post sign in')
      if (!validatedUser) {
        throw new Error('Failed to validate user after sign in')
      }
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
      const validatedUser = await validateUser('post sign up')
      if (!validatedUser) {
        throw new Error('Failed to validate user after sign up')
      }
    } catch (error) {
      console.error('[Auth Error] Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('[Auth Action] Attempting sign out')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[Auth Error] Sign out error:', error)
        throw error
      }
      
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('[Auth Error] Sign out error:', error)
      // Ensure user is redirected to login even on error
      setUser(null)
      router.push('/login')
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