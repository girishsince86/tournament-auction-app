'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { AuthContextType, AuthUser } from '@/types/auth'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'

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

  // Initialize Supabase client on mount
  useEffect(() => {
    const initSupabase = async () => {
      if (!supabaseRef.current) {
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
        supabaseRef.current = createClientComponentClient()
      }
    }
    initSupabase()
  }, [])

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = ['/login', '/register', '/'].includes(pathname)
      const isPublicRoute = pathname.startsWith('/tournaments/register')
      const isLoginPage = pathname === '/login'
      const isProtectedRoute = !isPublicRoute && [
        '/dashboard',
        '/players',
        '/teams',
        '/tournaments',
        '/auctions'
      ].some(route => pathname === route || pathname.startsWith(route + '/'))

      console.log('Navigation check:', { 
        user: user?.email, 
        isAuthRoute,
        isProtectedRoute,
        isPublicRoute,
        isLoginPage,
        pathname,
        cookies: typeof document !== 'undefined' ? document.cookie : ''
      })
      
      // Don't redirect from login page unless explicitly logged in
      if (user && isAuthRoute && !isPublicRoute && !isLoginPage) {
        console.log('Authenticated user on auth route - redirecting to dashboard')
        router.push('/dashboard')
      } else if (!user && isProtectedRoute) {
        console.log('Unauthenticated user on protected route - redirecting to login')
        router.push('/login')
      }
    }
  }, [user, isLoading, pathname, router])

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    console.log('Auth provider mounted')

    const initializeAuth = async () => {
      try {
        if (!supabaseRef.current) return

        console.log('Initializing auth...')
        const { data: { session }, error: sessionError } = await supabaseRef.current.auth.getSession()
        
        if (sessionError) {
          console.error('Session fetch error:', sessionError)
          throw sessionError
        }

        console.log('Session check:', {
          hasSession: !!session,
          user: session?.user?.email,
          timestamp: new Date().toISOString(),
          cookies: typeof document !== 'undefined' ? document.cookie : ''
        })
        
        if (session?.user && mounted) {
          console.log('Setting initial user:', session.user.email)
          setUser(session.user)
        }
        
        if (mounted) {
          setIsLoading(false)
        }

        const {
          data: { subscription },
        } = supabaseRef.current.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change detected:', {
            event,
            email: session?.user?.email,
            timestamp: new Date().toISOString(),
            cookies: typeof document !== 'undefined' ? document.cookie : ''
          })
          
          if (!mounted) return

          if (session?.user) {
            console.log('Updating user state:', session.user.email)
            setUser(session.user)
            
            if (event === 'SIGNED_IN' && !pathname.startsWith('/tournaments/register')) {
              console.log('Processing SIGNED_IN event - forcing navigation')
              // Add a small delay to ensure cookies are set
              await new Promise(resolve => setTimeout(resolve, 500))
              router.push('/dashboard')
            }
          } else {
            console.log('Clearing user state')
            setUser(null)
            if (event === 'SIGNED_OUT' && !pathname.startsWith('/tournaments/register')) {
              console.log('Processing SIGNED_OUT event - forcing navigation')
              router.push('/login')
            }
          }
          
          setIsLoading(false)
        })

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

    initializeAuth()

    return () => {
      console.log('Auth provider unmounting')
    }
  }, [pathname, router])

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabaseRef.current) throw new Error('Supabase client not initialized')

      console.log('Starting sign in process...')
      setIsLoading(true)
      setError(null)
      
      console.log('Calling Supabase signInWithPassword...')
      const { data, error } = await supabaseRef.current.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Sign in error:', error)
        toast.error(error.message)
        setError(error)
        throw error
      }
      
      console.log('Sign in API call successful:', {
        user: data.user?.email,
        timestamp: new Date().toISOString(),
        cookies: typeof document !== 'undefined' ? document.cookie : ''
      })
      
      // Set user immediately
      setUser(data.user)
      toast.success('Signed in successfully')
      
      // Add a longer delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Only redirect to dashboard if not on registration page
      if (!pathname.startsWith('/tournaments/register')) {
        console.log('Forcing navigation to dashboard')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign in process error:', error)
      setError(error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      if (!supabaseRef.current) throw new Error('Supabase client not initialized')

      setIsLoading(true)
      setError(null)
      console.log('Attempting sign out...')
      
      const { error } = await supabaseRef.current.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        toast.error(error.message)
        throw error
      }
      
      console.log('Sign out successful')
      setUser(null)
      toast.success('Signed out successfully')
      
      // Only redirect to login if not on registration page
      if (!pathname.startsWith('/tournaments/register')) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      if (!supabaseRef.current) throw new Error('Supabase client not initialized')

      setError(null)
      const { error } = await supabaseRef.current.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/verify-email`
            : `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`
        }
      })
      if (error) {
        toast.error(error.message)
        throw error
      }
      toast.success('Verification email sent')
      router.push('/verify-email')
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      if (!supabaseRef.current) throw new Error('Supabase client not initialized')

      setError(null)
      const { error } = await supabaseRef.current.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/update-password`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`
      })
      if (error) {
        toast.error(error.message)
        throw error
      }
      toast.success('Password reset email sent')
      router.push('/check-email')
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    error,
    signIn,
    signOut,
    signUp,
    resetPassword
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