const checkNavigation = (user: string | null, pathname: string) => {
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
    const redirectUrl = new URL('/auth/login', window.location.origin)
    redirectUrl.searchParams.set('redirect', pathname)
    window.location.href = redirectUrl.toString()
    return
  }

  // If user is signed in and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    window.location.href = '/dashboard'
    return
  }
} 