'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/types/supabase'
import { toast } from 'react-hot-toast'
import { SupabaseClient } from '@supabase/supabase-js'
import { getPathname, getOrigin } from '@/lib/utils/browser'
import { getSupabaseUrl, getSupabaseStorageKey } from '@/lib/supabase/url'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updatePassword: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)

  // Initialize Supabase client on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const client = createBrowserClient<Database>(
        getSupabaseUrl(),
        supabaseAnonKey,
        // storageKey must match the direct Supabase URL so cookies align with middleware
        { auth: { storageKey: getSupabaseStorageKey() } } as any
      );
      setSupabase(client);
    }
  }, []);

  // Validate user authentication
  const validateUser = async (source: string) => {
    if (!supabase) return null;
    
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

  // Check for user session on mount and set up auth state listener
  useEffect(() => {
    const getAuthenticatedUser = async () => {
      if (!supabase) return;
      
      try {
        setIsLoading(true)
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth Error] Session error:', error)
          setUser(null)
          return
        }
        
        if (session?.user) {
          console.log('[Auth] User session found')
          setUser(session.user)
        } else {
          console.log('[Auth] No user session found')
          setUser(null)
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[Auth Event]', event, {
              user: session?.user ? {
                id: session.user.id,
                email: session.user.email
              } : null
            })
            
            if (session?.user) {
              setUser(session.user)
            } else {
              setUser(null)
            }
            
            // Handle navigation based on auth state
            if (typeof window !== 'undefined') {
              const pathname = getPathname()
              
              if (event === 'SIGNED_IN') {
                // If user signed in and on an auth page, redirect to dashboard
                if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
                  router.push('/dashboard')
                }
              } else if (event === 'SIGNED_OUT') {
                // If user signed out and on a protected page, redirect to login
                if (!pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
                  router.push('/login')
                }
              }
            }
          }
        )
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('[Auth Error] Authentication error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (supabase) {
      getAuthenticatedUser()
    }
  }, [router, supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return;
    
    setIsLoading(true)
    try {
      console.log('[Auth Action] Attempting sign in')
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      // Validate user after sign in
      await validateUser('signIn')
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('[Auth Error] Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) return;
    
    setIsLoading(true)
    try {
      console.log('[Auth Action] Attempting sign up')
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error('[Auth Error] Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return;
    
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

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!supabase || !user) return;
    
    setIsLoading(true)
    try {
      console.log('[Auth Action] Verifying current password')
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });
      
      if (signInError) {
        console.error('[Auth Error] Current password verification failed:', signInError)
        throw new Error('Current password is incorrect')
      }
      
      console.log('[Auth Action] Attempting password update')
      // Then update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('[Auth Error] Password update error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 