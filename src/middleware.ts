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
    teamOwner: {
      profile: '/team-owner/profile' as const,
    },
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
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/profile',
  '/teams',
  '/players',
  '/team-owners',
  '/tournaments/register',
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
  '/team-management',
  '/team-owner/profile',
  '/auction'
]

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
  // Define known admin emails (these will have full admin access)
  const adminEmails = [
    'gk@pbel.in', // Super admin
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

// Helper function to check if a user can access team owner features
const canAccessTeamOwnerFeatures = (email?: string): boolean => {
  return isFullAdmin(email) || isTeamOwner(email);
}

// Define admin-only routes
const adminRoutes = [
  '/admin',
];

// Define routes that should redirect authenticated users
const authRoutes = [
  '/login',
  '/register',
];

// This middleware runs on all routes
export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Redirect malformed registration URL (e.g. WhatsApp copy-paste appends 📅 emoji after the link)
    const registerBase = '/tournaments/register';
    if (
      pathname.startsWith(registerBase) &&
      pathname !== registerBase &&
      !pathname.startsWith(registerBase + '/')
    ) {
      return NextResponse.redirect(new URL(registerBase, request.url));
    }
    
    // Skip middleware for static files, API routes, and public routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') ||
      pathname.startsWith('/api') ||
      PUBLIC_ROUTES.some(route => pathname === route) // Exact match for public routes
    ) {
      return NextResponse.next();
    }
    
    // Create a Supabase client for the middleware
    const res = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req: request, res });
    
    // Check if the user is authenticated
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth session error in middleware:', authError);
      // Continue to the page, but the page itself should handle auth errors
      return NextResponse.next();
    }
    
    // If the user is not authenticated and trying to access a protected route
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
    
    // Only check protected routes if it's not a public route
    if (!isPublicRoute) {
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
      
      if (!session && isProtectedRoute) {
        // Redirect to login page with a return URL
        const redirectUrl = new URL(ROUTES.auth.login, request.url);
        redirectUrl.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // If the user is authenticated and trying to access an auth page
    if (session && isAuthPath(pathname)) {
      // Redirect to the default page after login
      return NextResponse.redirect(new URL(ROUTES.defaultRedirect, request.url));
    }
    
    // For admin routes, check if the user has admin privileges
    if (pathname.startsWith('/admin') && session) {
      const userEmail = session.user?.email;
      if (!isFullAdmin(userEmail)) {
        // Redirect non-admin users to the dashboard
        return NextResponse.redirect(new URL(ROUTES.defaultRedirect, request.url));
      }
    }
    
    // For team owner routes, check if the user has team owner or admin privileges
    if (pathname.startsWith('/team-owner') && session) {
      const userEmail = session.user?.email;
      if (!canAccessTeamOwnerFeatures(userEmail)) {
        // Redirect users without team owner access to the dashboard
        return NextResponse.redirect(new URL(ROUTES.defaultRedirect, request.url));
      }
    }
    
    // Create a response object from the incoming request
    const response = NextResponse.next();
    
    // Set headers to force dynamic rendering and prevent caching
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (err) {
    console.error('Middleware error:', err);
    
    // For API routes, return a JSON error response
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: 'An unexpected error occurred in the middleware',
          path: request.nextUrl.pathname
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For non-API routes, continue to the page and let the error boundary handle it
    return NextResponse.next();
  }
}

// Configure the middleware to run on all routes except for static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 