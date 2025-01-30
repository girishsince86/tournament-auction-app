import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the current user's ID
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create a default tournament
    const tournament = {
      name: 'Volleyball Tournament 2024',
      description: 'Annual volleyball tournament',
      start_date: new Date(2024, 1, 1).toISOString(),
      end_date: new Date(2024, 12, 31).toISOString(),
      registration_deadline: new Date(2024, 11, 31).toISOString(),
      status: 'REGISTRATION_OPEN',
      max_teams: 16,
      created_by: session.user.id
    }

    console.log('Creating tournament:', tournament)

    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournament)
      .select('id')
      .single()

    if (error) {
      console.error('Tournament creation error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create tournament', 
          details: error.message,
          code: error.code,
          hint: error.hint 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tournamentId: data.id,
      message: 'Tournament created successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 