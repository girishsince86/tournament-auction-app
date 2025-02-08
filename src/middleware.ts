import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedPaths = ['/admin', '/registration-summary', '/dashboard', '/manage-registrations']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Handle protected routes
  if (isProtectedPath) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Special case: redirect /dashboard to /registration-summary
    if (request.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/registration-summary', request.url))
    }
  }

  return res
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/registration-summary',
    '/dashboard/:path*',
    '/manage-registrations/:path*',
    '/login',
  ]
} 