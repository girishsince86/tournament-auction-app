import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/lib/supabase/types/supabase'

interface User {
  id: string
  email?: string
  app_metadata: Record<string, any>
  raw_app_meta_data?: {
    role?: string
    provider?: string
    providers?: string[]
  }
}

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
    api: {
      base: '/api' as const,
      auction: '/api/auction' as const,
      teams: '/api/teams' as const,
      players: '/api/players' as const,
    },
    registrationSummary: '/registration-summary' as const,
    dashboard: '/dashboard' as const,
  },
  public: {
    home: '/' as const,
    profile: '/profile' as const,
    tournaments: {
      register: '/tournaments/register' as const,
    }
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
    ROUTES.auth.verifyEmail,
    ROUTES.auth.callback
  ]
  return authPaths.includes(path as typeof authPaths[number])
}

const PUBLIC_ROUTES = [
  '/login', 
  '/signup', 
  '/auth/callback',
  '/tournaments/register'
]

const ADMIN_ROUTES = [
  '/admin/manage-registrations',
  '/admin/volleyball-players',
  '/admin/auction',
  '/admin/team-budgets'
]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session }, error } = await supabase.auth.getSession()

  const isPublicRoute = PUBLIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))
  const isRegistrationPage = request.nextUrl.pathname === '/tournaments/register'

  // Handle authentication
  if (!session) {
    if (!isPublicRoute && !isRegistrationPage) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }

  // Handle admin routes
  if (isAdminRoute) {
    const isAdmin = session.user.email?.endsWith('@pbel.in') ||
                   session.user.app_metadata?.role === 'admin' ||
                   session.user.user_metadata?.role === 'admin'

    if (!isAdmin) {
      // Redirect non-admin users to registration summary
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/registration-summary'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle public routes when user is authenticated
  if (isPublicRoute && !isRegistrationPage && session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/registration-summary'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|api).*)',
  ],
} 