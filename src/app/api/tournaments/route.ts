import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user's ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify admin access (check if email is from the admin domain)
    if (!session.user.email?.endsWith('@admin.com')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const tournament = await request.json()

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        ...tournament,
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating tournament:', error)
      return NextResponse.json(
        { error: 'Failed to create tournament' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tournament: data,
      message: 'Tournament created successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tournaments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tournaments' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tournaments: data,
      message: 'Tournaments retrieved successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 