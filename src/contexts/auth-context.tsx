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
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = new URL('/auth/login', origin)
    redirectUrl.searchParams.set('redirect', pathname)
    
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl.toString()
    }
    return
  }

  // If user is signed in and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute && typeof window !== 'undefined') {
    window.location.href = '/dashboard'
    return
  }
}