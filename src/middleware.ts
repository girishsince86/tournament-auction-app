import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/lib/supabase/types/supabase'

// Centralized route configuration
const ROUTES = {
  auth: {
    login: '/login' as const,
    register: '/register' as const,
    verifyEmail: '/verify-email' as const,
    callback: '/auth/callback' as const,
  },
  protected: {
    admin: {
      base: '/admin' as const,
      manageRegistrations: '/admin/manage-registrations' as const,
      volleyballPlayers: '/admin/volleyball-players' as const,
    },
    registrationSummary: '/registration-summary' as const,
    dashboard: '/dashboard' as const,
  },
  public: {
    home: '/' as const,
    profile: '/profile' as const,
    tournaments: {
      register: '/tournaments/register' as const,
    },
  },
  defaultRedirect: '/registration-summary' as const,
} as const

// Helper to check if a path starts with any of the given prefixes
const pathStartsWith = (path: string, prefixes: readonly string[]): boolean =>
  prefixes.some(prefix => path.startsWith(prefix))

// Helper to check if a path is an auth path
const isAuthPath = (path: string): boolean => {
  const authPaths = [
    ROUTES.auth.login,
    ROUTES.auth.register,
    ROUTES.auth.verifyEmail
  ]
  return authPaths.includes(path as typeof authPaths[number])
}

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const { pathname } = request.nextUrl

    // Create supabase server client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({ name, ...options })
          },
        },
      }
    )

    // Get authenticated user data
    const { data: { user }, error } = await supabase.auth.getUser()

    const isProtectedPath = pathStartsWith(pathname, [
      ROUTES.protected.admin.base,
      ROUTES.protected.registrationSummary,
      ROUTES.protected.dashboard
    ])

    const isAdminPath = pathname.startsWith(ROUTES.protected.admin.base)

    // Handle authentication paths (login/register)
    if (isAuthPath(pathname)) {
      if (user) {
        // If user is already logged in, redirect to default page
        return NextResponse.redirect(new URL(ROUTES.defaultRedirect, request.url))
      }
      return response
    }

    // Handle protected paths
    if (isProtectedPath) {
      if (!user) {
        // Store the original URL to redirect back after login
        const redirectUrl = new URL(ROUTES.auth.login, request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Special case: redirect /dashboard to default page
      if (pathname === ROUTES.protected.dashboard) {
        return NextResponse.redirect(new URL(ROUTES.defaultRedirect, request.url))
      }

      // Handle admin routes
      if (isAdminPath) {
        const userEmail = user.email
        if (!userEmail?.endsWith('@pbel.in')) {
          return NextResponse.redirect(new URL(ROUTES.defaultRedirect, request.url))
        }
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/registration-summary',
    '/dashboard',
    
    // Auth routes
    '/login',
    '/register',
    '/verify-email',
    
    // Profile routes
    '/profile/:path*'
  ]
} 