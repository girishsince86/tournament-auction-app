import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

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

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all tournaments with is_active flag
    const { data: tournaments, error } = await supabase
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

    // Find the current (active) tournament
    const currentTournament = tournaments.find(t => t.is_active)

    return NextResponse.json({
      tournaments,
      currentTournament
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 