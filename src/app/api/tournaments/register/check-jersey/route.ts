import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
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
      console.error('Jersey check error:', error)
      return NextResponse.json(
        { error: 'Failed to check jersey number', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      available: !data,
      jerseyNumber
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 