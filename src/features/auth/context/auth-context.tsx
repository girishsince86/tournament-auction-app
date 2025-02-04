'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { AuthContextType, AuthUser } from '@/types/auth'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a ClientComponent wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return <>{children}</>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabaseRef = useRef<SupabaseClient | null>(null)

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    console.log('Auth provider mounted')

    const initializeAuth = async () => {
      try {
        // Initialize Supabase client if not already initialized
        if (!supabaseRef.current) {
          console.log('Initializing Supabase client...')
          supabaseRef.current = createClientComponentClient()
        }

        console.log('Checking session...')
        const { data: { session }, error: sessionError } = await supabaseRef.current.auth.getSession()
        
        if (sessionError) {
          console.error('Session fetch error:', sessionError)
          throw sessionError
        }

        console.log('Session check:', {
          hasSession: !!session,
          user: session?.user?.email,
          timestamp: new Date().toISOString()
        })
        
        if (session?.user && mounted) {
          console.log('Setting initial user:', session.user.email)
          setUser(session.user)
        } else {
          console.log('No session found')
          setUser(null)
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = supabaseRef.current.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email)
          
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
          setIsLoading(false)
        })

        if (mounted) {
          setIsLoading(false)
        }

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setError(error as Error)
          setIsLoading(false)
        }
      }
    }

    const cleanup = initializeAuth()
    
    return () => {
      console.log('Auth provider unmounting')
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoading) {
      const isLoginPage = pathname === '/login'
      const isPublicRoute = pathname.startsWith('/tournaments/register')
      const isAdminRoute = pathname.startsWith('/admin')
      
      console.log('Navigation check:', {
        isAdminRoute,
        isLoginPage,
        isPublicRoute,
        userEmail: user?.email,
        pathname
      })

      if (isAdminRoute && !user?.email?.endsWith('@pbel.in')) {
        console.log('Unauthorized access to admin route - redirecting to login')
        router.push('/login')
      } else if (user && isLoginPage) {
        // If user is logged in and on login page, redirect to appropriate page
        console.log('User is logged in on login page - redirecting')
        if (user.email?.endsWith('@pbel.in')) {
          router.push('/admin/registrations')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [user, isLoading, pathname, router])

  const value = {
    user,
    isLoading,
    error,
    signIn: async (email: string, password: string) => {
      try {
        if (!supabaseRef.current) throw new Error('Supabase client not initialized')
        setIsLoading(true)
        const { data, error } = await supabaseRef.current.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setUser(data.user)
        toast.success('Signed in successfully')
        
        // Handle post-login navigation
        if (data.user.email?.endsWith('@pbel.in')) {
          router.push('/admin/registrations')
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to sign in')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    signOut: async () => {
      try {
        if (!supabaseRef.current) throw new Error('Supabase client not initialized')
        setIsLoading(true)
        const { error } = await supabaseRef.current.auth.signOut()
        if (error) throw error
        setUser(null)
        toast.success('Signed out successfully')
        router.push('/login')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to sign out')
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        if (!supabaseRef.current) throw new Error('Supabase client not initialized')
        const { error } = await supabaseRef.current.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('Verification email sent')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to sign up')
        throw error
      }
    },
    resetPassword: async (email: string) => {
      try {
        if (!supabaseRef.current) throw new Error('Supabase client not initialized')
        const { error } = await supabaseRef.current.auth.resetPasswordForEmail(email)
        if (error) throw error
        toast.success('Password reset email sent')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to reset password')
        throw error
      }
    },
  }

  return (
    <AuthContext.Provider value={value}>
      <ClientOnly>
        {children}
      </ClientOnly>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 