import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { amount, verification_notes, verified_by } = await request.json()

    if (!amount || !verified_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if registration exists and is not already verified
    const { data: registration, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select()
      .eq('id', params.id)
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

    // Update registration with verification details
    const { error: updateError } = await supabase
      .from('tournament_registrations')
      .update({
        is_verified: true,
        amount_received: amount,
        verification_notes,
        verified_by,
        verified_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Update error:', updateError)
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