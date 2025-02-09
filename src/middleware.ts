import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/lib/supabase/types/supabase'

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()

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
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get authenticated user data
    const { data: { user }, error } = await supabase.auth.getUser()

    // Define route patterns
    const protectedPaths = ['/admin', '/registration-summary', '/dashboard']
    const authPaths = ['/login', '/register']

    const currentPath = request.nextUrl.pathname
    
    // Check if current path matches any of our defined patterns
    const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path))
    const isAuthPath = authPaths.some(path => currentPath.startsWith(path))

    // Handle authentication paths (login/register)
    if (isAuthPath) {
      if (user) {
        // If user is already logged in, redirect to registration summary
        return NextResponse.redirect(new URL('/registration-summary', request.url))
      }
      return response
    }

    // Handle protected paths
    if (isProtectedPath) {
      if (!user) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Special case: redirect /dashboard to /registration-summary
      if (currentPath === '/dashboard') {
        return NextResponse.redirect(new URL('/registration-summary', request.url))
      }

      // Check admin access for /admin routes
      if (currentPath.startsWith('/admin')) {
        const userEmail = user.email
        if (!userEmail?.endsWith('@pbel.in')) {
          return NextResponse.redirect(new URL('/registration-summary', request.url))
        }
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login for safety
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/admin/:path*',
    '/registration-summary',
    '/dashboard/:path*',
    
    // Auth routes (login/register)
    '/login',
    '/register',
  ]
} 