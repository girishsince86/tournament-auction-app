import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js'
import { RegistrationCategory } from '@/features/tournaments/types/registration'
import { categoryRequiresDoB, validateDoBForCategory } from '@/features/tournaments/components/registration/registration-age'

export const dynamic = 'force-dynamic'
export const maxDuration = 60; // Set to maximum allowed for hobby plan (60 seconds)

interface RegistrationResponse {
  id: string;
  [key: string]: any;
}

// Separate function for database operations with retry logic
async function performDatabaseOperation<T>(
  operation: () => Promise<PostgrestSingleResponse<T | null>>,
  maxRetries: number = 3,
  timeoutMs: number = 8000
): Promise<PostgrestSingleResponse<T | null>> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries}...`)
      
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
        )
      ]) as PostgrestSingleResponse<T | null>

      if (result.error) {
        throw result.error
      }

      return result
    } catch (error) {
      lastError = error
      console.error(`Attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 4000)
        await new Promise(resolve => setTimeout(resolve, backoffTime))
        continue
      }
    }
  }

  throw lastError
}

/** Extract a string suitable for API response from any thrown value. */
function getErrorDetails(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object') {
    const o = error as Record<string, unknown>
    if (typeof o.message === 'string') return o.message
    if (o.details != null) return typeof o.details === 'string' ? o.details : JSON.stringify(o.details)
    return JSON.stringify(o)
  }
  return String(error)
}

/** Columns that must not be empty string for DB (use null so defaults or nullable apply). */
const TIMESTAMP_OR_ID_FIELDS = ['id', 'created_at', 'updated_at', 'date_of_birth', 'verified_at', 'profile_token_expires_at']

function sanitizeRegistrationPayload(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data }
  // Let DB set id, created_at, updated_at
  delete out.id
  delete out.created_at
  delete out.updated_at
  // Convert empty strings to null for timestamp/date fields (DB rejects '' for these types)
  for (const key of TIMESTAMP_OR_ID_FIELDS) {
    if (key in out && (out[key] === '' || out[key] === undefined)) out[key] = null
  }
  return out
}

export async function POST(request: NextRequest) {
  console.log('Starting registration process...')
  const startTime = Date.now()
  
  try {
    const supabase = createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database client not available' },
        { status: 503 }
      )
    }

    const data = await request.json()
    console.log('Received registration data:', {
      email: data.email,
      category: data.registration_category,
      type: data.registration_type
    })

    // Validate required fields first
    const requiredFields = ['email', 'registration_category', 'first_name', 'last_name']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate date of birth for categories that require it (youth, VB, TB Women)
    const category = data.registration_category as RegistrationCategory
    if (categoryRequiresDoB(category)) {
      if (!data.date_of_birth) {
        return NextResponse.json(
          { error: 'Date of birth is required for this category' },
          { status: 400 }
        )
      }
      const dobError = validateDoBForCategory(String(data.date_of_birth), category)
      if (dobError) {
        return NextResponse.json(
          { error: dobError },
          { status: 400 }
        )
      }
    }

    // Check for existing registration with retry logic
    console.log('Checking for existing registration...')
    try {
      const existingRegistration = await performDatabaseOperation<RegistrationResponse>(
        async () => {
          return await supabase
            .from('tournament_registrations')
            .select('id, registration_category')
            .eq('email', data.email)
            .eq('registration_category', data.registration_category)
            .maybeSingle()
        },
        3, // 3 retries
        5000 // 5 second timeout
      )

      if (existingRegistration.data?.id) {
        return NextResponse.json(
          { error: 'A registration with this email already exists for this category' },
          { status: 400 }
        )
      }
    } catch (error) {
      if (error instanceof PostgrestError) {
        if (error.code !== 'PGRST116') { // Not found error is expected
          throw error
        }
      } else {
        throw error
      }
    }

    // Insert new registration with retry logic (sanitize so empty strings don't break timestamp columns)
    const insertPayload = sanitizeRegistrationPayload(data)
    console.log('Creating new registration...')
    const { data: registration, error: insertError } = await performDatabaseOperation<RegistrationResponse>(
      async () => {
        return await supabase
          .from('tournament_registrations')
          .insert([insertPayload])
          .select('id')
          .single()
      },
      3, // 3 retries
      15000 // 15 second timeout
    )

    if (insertError) {
      throw insertError
    }

    if (!registration?.id) {
      throw new Error('Failed to create registration')
    }

    const processingTime = Date.now() - startTime
    console.log(`Registration completed successfully in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: 'Registration submitted successfully',
      processingTime
    })

  } catch (error: unknown) {
    const processingTime = Date.now() - startTime
    const details = getErrorDetails(error)
    console.error('Registration error:', error, `(after ${processingTime}ms)`)
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Error code/details:', (error as PostgrestError).code, (error as PostgrestError).details)
    }

    if (error instanceof Error && error.message === 'Database operation timed out') {
      return NextResponse.json(
        {
          error: 'Registration timed out. Please try again.',
          details: 'The server is experiencing high load. Please wait a moment and try again.',
        },
        { status: 504 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to process registration',
        details,
      },
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