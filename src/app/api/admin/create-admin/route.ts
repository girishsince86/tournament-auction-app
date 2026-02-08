import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    const { email, password } = await request.json()

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    if (!password?.trim()) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    if (!email.endsWith('@pbel.in')) {
      return NextResponse.json(
        { error: 'Only @pbel.in email addresses are allowed' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true,
    })

    if (error) {
      console.error('Error creating admin:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create admin user' },
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