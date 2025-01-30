import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const registration = await request.json()

    console.log('Received registration data:', registration)

    try {
      // Format the registration data to match the schema exactly
      const registrationData = {
        first_name: String(registration.first_name).trim(),
        last_name: String(registration.last_name).trim(),
        phone_number: String(registration.phone_number).trim(),
        flat_number: String(registration.flat_number).trim().toUpperCase(),
        height: parseFloat((Number(registration.height) / 100).toFixed(2)), // Convert to meters with 2 decimal places
        last_played_date: String(registration.last_played_date),
        registration_category: registration.registration_category,
        registration_type: String(registration.registration_type).trim(),
        playing_positions: Array.isArray(registration.playing_positions) 
          ? registration.playing_positions.map(String) 
          : [String(registration.playing_positions)],
        skill_level: registration.skill_level,
        tshirt_number: String(registration.tshirt_number).trim(),
        tshirt_name: String(registration.tshirt_name).trim(),
        tshirt_size: registration.tshirt_size,
        payment_upi_id: String(registration.payment_upi_id).trim(),
        payment_transaction_id: String(registration.payment_transaction_id).trim(),
        paid_to: String(registration.paid_to).trim(),
        is_verified: false
      }

      // Validate numeric fields
      if (isNaN(registrationData.height) || registrationData.height < 1.0 || registrationData.height > 2.5) {
        throw new Error('Height must be between 1.0m and 2.5m')
      }

      // Validate last_played_date enum
      const validLastPlayedStatuses = ['PLAYING_ACTIVELY', 'NOT_PLAYED_SINCE_LAST_YEAR', 'NOT_PLAYED_IN_FEW_YEARS']
      if (!validLastPlayedStatuses.includes(registrationData.last_played_date)) {
        throw new Error('Invalid last played status')
      }

      console.log('Formatted registration data:', registrationData)

      // Insert the registration
      const { data, error } = await supabase
        .from('tournament_registrations')
        .insert(registrationData)
        .select('id')
        .single()

      if (error) {
        console.error('Database error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          data: registrationData
        })
        throw error
      }

      console.log('Registration successful:', data)

      return NextResponse.json(
        { 
          success: true, 
          registrationId: data.id,
          message: 'Registration submitted successfully'
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      )
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { 
          error: 'Failed to submit registration', 
          details: dbError.message,
          code: dbError.code,
          hint: dbError.hint || 'Please check your input data'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Check registration status
    if (searchParams.has('registration_id')) {
      const registrationId = searchParams.get('registration_id')

      console.log('Checking registration status:', registrationId)

      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (error) {
        console.error('Status check error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return NextResponse.json(
          { error: 'Failed to fetch registration status', details: error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        registration: data,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error },
      { status: 500 }
    )
  }
} 