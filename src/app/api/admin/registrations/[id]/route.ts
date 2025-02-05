import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: {
    id: string
  }
}

// Force dynamic to ensure we don't try to use during static build
export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const { id } = params

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching registration:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registration' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
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

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const { id } = params
    const updates = await request.json()
    console.log('Received update request for ID:', id)
    console.log('Update payload:', updates)

    // First check if the registration exists
    const { data: existingRegistration, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching registration:', {
        error: fetchError,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint
      })
      return NextResponse.json(
        { error: 'Registration not found', details: fetchError.message },
        { status: 404 }
      )
    }

    console.log('Found existing registration:', existingRegistration)

    // Prepare update data by merging existing data with updates
    const updateData = {
      // Personal Information
      first_name: updates.first_name ?? existingRegistration.first_name,
      last_name: updates.last_name ?? existingRegistration.last_name,
      email: updates.email ?? existingRegistration.email,
      phone_number: updates.phone_number ?? existingRegistration.phone_number,
      flat_number: updates.flat_number ?? existingRegistration.flat_number,
      
      // Registration Details
      registration_category: updates.registration_category ?? existingRegistration.registration_category,
      registration_type: updates.registration_type ?? existingRegistration.registration_type,
      
      // Player Profile
      height: updates.height ?? existingRegistration.height,
      last_played_date: updates.last_played_date ?? existingRegistration.last_played_date,
      playing_positions: updates.playing_positions ?? existingRegistration.playing_positions,
      skill_level: updates.skill_level ?? existingRegistration.skill_level,
      
      // Jersey Details
      tshirt_size: updates.tshirt_size ?? existingRegistration.tshirt_size,
      tshirt_number: updates.tshirt_number ?? existingRegistration.tshirt_number,
      tshirt_name: updates.tshirt_name ?? existingRegistration.tshirt_name,
      
      // Payment Information
      payment_upi_id: updates.payment_upi_id ?? existingRegistration.payment_upi_id,
      payment_transaction_id: updates.payment_transaction_id ?? existingRegistration.payment_transaction_id,
      paid_to: updates.paid_to ?? existingRegistration.paid_to,
      
      // Youth Category Fields
      date_of_birth: updates.date_of_birth ?? existingRegistration.date_of_birth,
      parent_name: updates.parent_name ?? existingRegistration.parent_name,
      parent_phone_number: updates.parent_phone_number ?? existingRegistration.parent_phone_number,
      
      // Admin Fields
      is_verified: updates.is_verified !== undefined ? updates.is_verified : existingRegistration.is_verified,
    }

    // Now perform the update
    const { data, error } = await supabase
      .from('tournament_registrations')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating registration:', {
        error,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json(
        { error: 'Failed to update registration', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.error('No data returned after update')
      return NextResponse.json(
        { error: 'Registration not found after update' },
        { status: 404 }
      )
    }

    console.log('Successfully updated registration:', data[0])
    return NextResponse.json({ registration: data[0] })
  } catch (error) {
    console.error('Unexpected error during update:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const { id } = params

    const { error } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting registration:', error)
      return NextResponse.json(
        { error: 'Failed to delete registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 