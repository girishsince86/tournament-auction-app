import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PostgrestSingleResponse, PostgrestError, SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Set to 60 seconds to match Vercel's limit

interface RegistrationResponse {
  id: string;
  [key: string]: any;
}

// Separate function for database operations with timeout
async function performDatabaseOperation<T>(
  operation: () => Promise<PostgrestSingleResponse<T>>, 
  timeoutMs: number = 8000
): Promise<PostgrestSingleResponse<T>> {
  const result = await Promise.race([
    operation(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
    )
  ]) as PostgrestSingleResponse<T>

  if (result.error) {
    throw result.error
  }

  return result
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const data = await request.json()

    // Validate required fields first
    if (!data.email || !data.category || !data.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for existing registration with 3s timeout
    try {
      const existingRegistration = await performDatabaseOperation<RegistrationResponse>(
        async () => {
          const response = await supabase
            .from('tournament_registrations')
            .select('id')
            .eq('email', data.email)
            .single()
          return response
        },
        3000
      )

      if (existingRegistration.data?.id) {
        return NextResponse.json(
          { error: 'A registration with this information already exists' },
          { status: 400 }
        )
      }
    } catch (error) {
      if (error instanceof PostgrestError) {
        // If no record found, continue with registration
        if (error.code === 'PGRST116') {
          // Continue with registration
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    // Insert new registration with 8s timeout
    const { data: registration, error: insertError } = await performDatabaseOperation<RegistrationResponse>(
      async () => {
        const response = await supabase
          .from('tournament_registrations')
          .insert([data])
          .select('id')
          .single()
        return response
      },
      8000
    )

    if (insertError) {
      throw insertError
    }

    if (!registration?.id) {
      throw new Error('Failed to create registration')
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: 'Registration submitted successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.message === 'Database operation timed out') {
      return NextResponse.json(
        { error: 'Registration timed out. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

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