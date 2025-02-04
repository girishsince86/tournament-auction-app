import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jerseyNumber = searchParams.get('jersey_number')

    if (!jerseyNumber) {
      return NextResponse.json(
        { error: 'Jersey number is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tshirt_number', jerseyNumber)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking jersey number:', error)
      return NextResponse.json(
        { error: 'Failed to check jersey number' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isAvailable: !data,
      message: data ? 'Jersey number is already taken' : 'Jersey number is available'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 