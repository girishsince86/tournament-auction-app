import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    
    const registrationId = searchParams.get('registration_id')

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Missing registration ID' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch registration status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      registration: data,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 