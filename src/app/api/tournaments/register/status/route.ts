import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const registrationId = searchParams.get('registration_id')
    
    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (error) {
      console.error('Error fetching registration status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registration status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      registration: data,
      message: 'Registration status retrieved successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 