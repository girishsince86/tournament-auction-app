import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Log the token being validated
    console.log('Validating token:', params.token)

    // Validate token and get player
    const { data: registrationId, error: validationError } = await supabase
      .rpc('validate_profile_token', { token_input: params.token })

    if (validationError) {
      console.error('Token validation error:', validationError)
      return NextResponse.json(
        { error: `Invalid profile link: ${validationError.message}` },
        { status: 404 }
      )
    }

    if (!registrationId) {
      console.error('No registration found for token:', params.token)
      return NextResponse.json(
        { error: 'Profile link has expired or is invalid' },
        { status: 404 }
      )
    }

    console.log('Found registration ID:', registrationId)

    // Get player details
    const { data: player, error: playerError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (playerError) {
      console.error('Error fetching player details:', playerError)
      return NextResponse.json(
        { error: `Failed to fetch player details: ${playerError.message}` },
        { status: 404 }
      )
    }

    if (!player) {
      console.error('No player found for ID:', registrationId)
      return NextResponse.json(
        { error: 'Player not found in the database' },
        { status: 404 }
      )
    }

    return NextResponse.json({ player })
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? `Failed to fetch profile: ${error.message}`
          : 'Failed to fetch profile'
      },
      { status: 500 }
    )
  }
} 