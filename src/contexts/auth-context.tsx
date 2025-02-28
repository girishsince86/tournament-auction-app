import { getOrigin, getPathname, navigateTo } from '@/lib/utils/browser'

const checkNavigation = (user: string | null, pathname: string) => {
  // Only run this function in the browser
  if (typeof window === 'undefined') return;
  
  const isAuthRoute = pathname.startsWith('/auth')
  const isPublicRoute = pathname.startsWith('/tournaments/register')
  const isProtectedRoute = !isAuthRoute && !isPublicRoute && pathname !== '/'

  console.log('Navigation check:', {
    user,
    isAuthRoute,
    isPublicRoute,
    isProtectedRoute,
    pathname,
    cookies: document.cookie
  })

  // If user is not signed in and the route is protected, redirect to login
  if (!user && isProtectedRoute) {
    // Safely create URL with origin
    const origin = getOrigin();
    const redirectUrl = new URL('/auth/login', origin)
    redirectUrl.searchParams.set('redirect', pathname)
    
    navigateTo(redirectUrl.toString())
    return
  }

  // If user is signed in and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    navigateTo('/dashboard')
    return
  }
}