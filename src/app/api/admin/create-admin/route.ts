import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { email, password } = await request.json()

    if (!email.endsWith('@pbel.in')) {
      return NextResponse.json(
        { error: 'Only @pbel.in email addresses are allowed' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error('Error creating admin:', error)
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: data.user
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 