import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }

    // Get the intended destination from the URL
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/registration-summary'
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
  }

  // Return to login if no code is present
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 