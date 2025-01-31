import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'
import { RegistrationCategory } from '@/lib/supabase/schema/tournaments'
import { SkillLevel, TShirtSize } from '@/lib/supabase/schema/players'

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
        email: String(registration.email).trim().toLowerCase(),
        phone_number: String(registration.phone_number).trim(),
        flat_number: String(registration.flat_number).trim().toUpperCase(),
        height: Number(registration.height), // Store as meters
        last_played_date: String(registration.last_played_date),
        registration_category: registration.registration_category,
        registration_type: String(registration.registration_type).trim(),
        playing_positions: Array.isArray(registration.playing_positions) 
          ? registration.playing_positions 
          : [registration.playing_positions],
        skill_level: registration.skill_level,
        tshirt_number: String(registration.tshirt_number).trim(),
        tshirt_name: String(registration.tshirt_name).trim(),
        tshirt_size: registration.tshirt_size,
        payment_upi_id: String(registration.payment_upi_id).trim(),
        payment_transaction_id: String(registration.payment_transaction_id).trim(),
        paid_to: String(registration.paid_to).trim(),
        is_verified: false,
        tournament_id: process.env.NEXT_PUBLIC_DEFAULT_TOURNAMENT_ID!, // Add the tournament ID
        // Add youth-specific fields with conditional handling
        date_of_birth: registration.date_of_birth || null,
        parent_name: registration.parent_name ? String(registration.parent_name).trim() : null,
        parent_phone_number: registration.parent_phone_number ? String(registration.parent_phone_number).trim() : null
      }

      // Validate numeric fields
      if (isNaN(registrationData.height) || registrationData.height < 1.0 || registrationData.height > 2.5) {
        throw new Error('Height must be between 1.0m and 2.5m')
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(registrationData.email)) {
        throw new Error('Invalid email format')
      }

      // Validate last_played_date enum
      const validLastPlayedStatuses = ['PLAYING_ACTIVELY', 'NOT_PLAYED_SINCE_LAST_YEAR', 'NOT_PLAYED_IN_FEW_YEARS']
      if (!validLastPlayedStatuses.includes(registrationData.last_played_date)) {
        throw new Error('Invalid last played status')
      }

      // Validate youth category fields
      if (registration.registration_category === 'THROWBALL_13_17_MIXED' || 
          registration.registration_category === 'THROWBALL_8_12_MIXED') {
        if (!registrationData.date_of_birth) {
          throw new Error('Date of birth is required for youth categories')
        }
        if (!registrationData.parent_name) {
          throw new Error('Parent/Guardian name is required for youth categories')
        }
        if (!registrationData.parent_phone_number) {
          throw new Error('Parent/Guardian phone number is required for youth categories')
        }
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

      if (!data?.id) {
        throw new Error('Failed to get registration ID')
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

      if (!registrationId) {
        return NextResponse.json(
          { error: 'Invalid registration ID' },
          { status: 400 }
        )
      }

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