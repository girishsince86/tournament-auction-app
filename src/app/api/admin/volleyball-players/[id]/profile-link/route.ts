import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verify this is a volleyball player
    const { data: player, error: playerError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', params.id)
      .eq('registration_category', 'VOLLEYBALL_OPEN_MEN')
      .single()

    if (playerError) {
      console.error('Error fetching player:', playerError)
      return NextResponse.json(
        { error: `Player not found: ${playerError.message}` },
        { status: 404 }
      )
    }

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found or not a volleyball player' },
        { status: 404 }
      )
    }

    // Generate profile token
    const { data: token, error: tokenError } = await supabase
      .rpc('generate_profile_token', { registration_id: params.id })

    if (tokenError) {
      console.error('Error generating token:', tokenError)
      return NextResponse.json(
        { error: `Failed to generate token: ${tokenError.message}` },
        { status: 500 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token generation returned no result' },
        { status: 500 }
      )
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error generating profile link:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? `Failed to generate profile link: ${error.message}`
          : 'Failed to generate profile link'
      },
      { status: 500 }
    )
  }
} 