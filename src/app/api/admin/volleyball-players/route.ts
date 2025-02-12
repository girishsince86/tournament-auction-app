import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get volleyball players
    const { data: players, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('registration_category', 'VOLLEYBALL_OPEN_MEN')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error fetching volleyball players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch volleyball players' },
      { status: 500 }
    )
  }
} 