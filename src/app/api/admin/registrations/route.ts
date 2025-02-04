import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching registrations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ registrations: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const updates = await request.json()

    const { data, error } = await supabase
      .from('tournament_registrations')
      .update(updates)
      .eq('id', updates.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating registration:', error)
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ registration: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 