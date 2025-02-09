import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sortField = searchParams.get('sortField') || 'created_at'
    const sortDirection = searchParams.get('sortDirection') || 'desc'

    const supabase = createRouteHandlerClient<Database>({ cookies })

    let query = supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact' })

    // Handle filters
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key.startsWith('filter_')) {
        const field = key.replace('filter_', '')
        if (field === 'is_verified') {
          query = query.eq(field, value === 'true')
        } else if (value) {
          query = query.ilike(field, `%${value}%`)
        }
      }
    })

    // Apply sorting
    query = query.order(sortField, {
      ascending: sortDirection === 'asc',
      nullsFirst: false,
    })

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: registrations, count, error } = await query.range(from, to)

    if (error) {
      throw error
    }

    return NextResponse.json({
      registrations,
      total: count || 0,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { registration_id, payment_amount, payment_comments, verified_by } =
      await request.json()

    if (!registration_id || !payment_amount || !verified_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: registration, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select()
      .eq('id', registration_id)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    if (registration.is_verified) {
      return NextResponse.json(
        { error: 'Registration is already verified' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('tournament_registrations')
      .update({
        is_verified: true,
        payment_amount,
        payment_comments,
        verified_by,
        verified_at: new Date().toISOString(),
      })
      .eq('id', registration_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying registration:', error)
    return NextResponse.json(
      { error: 'Failed to verify registration' },
      { status: 500 }
    )
  }
} 