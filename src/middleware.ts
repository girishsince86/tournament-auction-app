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
      managePlayers: '/manage-players' as const,
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
  '/profile'
]

const ADMIN_ROUTES = [
  '/admin',
  '/admin/manage-registrations',
  '/manage-players',
  '/admin/auction',
  '/admin/team-budgets'
]

const PROTECTED_ROUTES = [
  '/registration-summary',
  '/dashboard',
  '/admin',
  '/teams',
  '/team-management'
]

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
  // Define known admin emails (these will have full admin access)
  const adminEmails = [
    'girish@pbel.in', // Super admin
    'admin@pbel.in',  // Admin
    'amit@pbel.in',   // Admin
    'vasu@pbel.in'    // Admin
  ]; // Add all admin emails here
  return email ? adminEmails.includes(email) : false;
}

// Define explicit list of team owner emails
const teamOwnerEmails = [
  'naveen@pbel.in',
  'anish@pbel.in',
  'subhamitra@pbel.in',
  'raju@pbel.in',
  'saravana@pbel.in',
  'praveenraj@pbel.in',
  'romesh@pbel.in',
  'srinivas@pbel.in',
  'sraveen@pbel.in'
];

// Helper function to check if a user is a team owner
const isTeamOwner = (email?: string): boolean => {
  return email ? teamOwnerEmails.includes(email) : false;
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session }, error } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  const isProfileRoute = pathname.startsWith('/profile/')
  const isTeamManagementRoute = pathname.startsWith('/team-management')

  // Handle authentication
  if (!session) {
    if (!isPublicRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }

  // Handle admin routes - only allow full admins
  if (isAdminRoute) {
    // Check if user is a full admin (not just a team owner with pbel.in email)
    if (!isFullAdmin(session.user.email)) {
      // Redirect non-admin users to registration summary
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/registration-summary'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle public routes when user is authenticated
  if (isPublicRoute && !isProfileRoute && session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/registration-summary'
    return NextResponse.redirect(redirectUrl)
  }

  // Get user's role from metadata
  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role

  // No need to protect team owner profile routes - any authenticated user can access
  return res
}

export const config = {
  matcher: [
    // Match only specific protected routes
    '/registration-summary',
    '/dashboard/:path*',
    '/admin/:path*',
    '/teams/:path*',
    '/profile/:path*',
    // Match auth routes
    '/login',
    '/signup',
    '/auth/callback',
    '/team-management/:path*'
  ]
} 