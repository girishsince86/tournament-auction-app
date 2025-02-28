import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get the current user's session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }
    
    // Check if user is an admin
    if (!session.user.email?.endsWith('@pbel.in')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10)
    const sortField = searchParams.get('sortField') || 'created_at'
    const sortDirection = searchParams.get('sortDirection') || 'desc'
    
    // Get filter parameters
    const filterParams: Record<string, string> = {}
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key.startsWith('filter_')) {
        const field = key.replace('filter_', '')
        filterParams[field] = value
      }
    })
    
    // Build the count query to get total number of records
    let countQuery = supabase
      .from('tournament_registrations')
      .select('id', { count: 'exact', head: true })
    
    // Apply filters to count query
    Object.entries(filterParams).forEach(([field, value]) => {
      if (field && value) {
        if (field === 'is_verified') {
          countQuery = countQuery.eq(field, value === 'true')
        } else {
          countQuery = countQuery.eq(field, value)
        }
      }
    })
    
    // Execute count query
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json(
        { error: 'Failed to count registrations' },
        { status: 500 }
      )
    }
    
    // Build the data query
    let dataQuery = supabase
      .from('tournament_registrations')
      .select('*')
    
    // Apply sorting
    dataQuery = dataQuery.order(sortField, { ascending: sortDirection === 'asc' })
    
    // Apply filters to data query
    Object.entries(filterParams).forEach(([field, value]) => {
      if (field && value) {
        if (field === 'is_verified') {
          dataQuery = dataQuery.eq(field, value === 'true')
        } else {
          dataQuery = dataQuery.eq(field, value)
        }
      }
    })
    
    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    dataQuery = dataQuery.range(from, to)
    
    // Execute data query
    const { data, error } = await dataQuery
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      registrations: data,
      total: count,
      page,
      pageSize
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    
    const { id, payment_status, payment_verified_by, payment_verified_at, admin_notes } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await adminClient
      .from('tournament_registrations')
      .update({
        is_verified: payment_status === 'VERIFIED',
        verified_by: payment_verified_by,
        verified_at: payment_verified_at,
        verification_notes: admin_notes
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      registration: data,
      message: 'Registration updated successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    
    const registration = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'first_name', 
      'last_name', 
      'email', 
      'phone_number', 
      'registration_category'
    ]
    
    for (const field of requiredFields) {
      if (!registration[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Additional validation for youth categories
    if (
      (registration.registration_category === 'THROWBALL_8_12_MIXED' || 
       registration.registration_category === 'THROWBALL_13_17_MIXED') && 
      !registration.parent_name
    ) {
      return NextResponse.json(
        { error: 'Parent name is required for youth categories' },
        { status: 400 }
      )
    }
    
    // Additional validation for volleyball positions
    if (
      registration.registration_category === 'VOLLEYBALL_OPEN_MEN' && 
      !registration.playing_position
    ) {
      return NextResponse.json(
        { error: 'Playing position is required for volleyball category' },
        { status: 400 }
      )
    }
    
    // Map last_played_date values to the correct enum values
    const mapLastPlayedDate = (value: string) => {
      switch (value) {
        case 'CURRENTLY_PLAYING':
          return 'PLAYING_ACTIVELY';
        case 'WITHIN_LAST_YEAR':
          return 'NOT_PLAYED_SINCE_LAST_YEAR';
        case 'WITHIN_LAST_5_YEARS':
        case 'MORE_THAN_5_YEARS':
        case 'NEVER_PLAYED':
          return 'NOT_PLAYED_IN_FEW_YEARS';
        default:
          return 'NOT_PLAYED_IN_FEW_YEARS';
      }
    };
    
    // Map tshirt_size values to match database enum
    const mapTshirtSize = (size: string) => {
      // Map to valid database enum values
      switch (size) {
        case 'XXL':
          return '2XL'; // Map XXL to 2XL to match database enum
        case '4XL':
          return '3XL'; // Map 4XL to 3XL (largest available size)
        default:
          return size; // Keep other sizes as is (XS, S, M, L, XL, 3XL are already correct)
      }
    };

    // Check if this is a volleyball registration
    const isVolleyball = registration.registration_category === 'VOLLEYBALL_OPEN_MEN';
    
    // Create a clean copy of the registration data without the playing_position field
    const { playing_position, ...registrationWithoutPosition } = registration;
    
    // Prepare registration data with conditional fields based on category
    const registrationData: any = {
      ...registrationWithoutPosition,
      // Convert height from centimeters to meters (e.g., 175cm -> 1.75m)
      height: registration.height ? parseFloat((registration.height / 100).toFixed(2)) : null,
      // Map last_played_date to the correct enum value
      last_played_date: registration.last_played_date ? mapLastPlayedDate(registration.last_played_date) : 'NOT_PLAYED_IN_FEW_YEARS',
      // Map tshirt_size to a valid database enum value
      tshirt_size: registration.tshirt_size ? mapTshirtSize(registration.tshirt_size) : null,
      created_at: new Date().toISOString(),
      is_verified: true,
      verified_at: new Date().toISOString()
    }
    
    // Handle empty date fields - convert empty strings to null
    if (registrationData.date_of_birth === '') {
      registrationData.date_of_birth = null;
    }
    
    // Handle playing_positions based on category
    if (isVolleyball) {
      // For volleyball, convert playing_position to playing_positions array
      registrationData.playing_positions = playing_position ? [playing_position] : [];
      
      // Ensure skill_level is set for volleyball
      if (!registrationData.skill_level) {
        return NextResponse.json(
          { error: 'Skill level is required for volleyball category' },
          { status: 400 }
        )
      }
    } else {
      // For non-volleyball categories, set default values
      registrationData.playing_positions = []; // Empty array instead of null
      registrationData.skill_level = registrationData.skill_level || 'RECREATIONAL_C'; // Default value
    }
    
    // Insert the registration
    const { data, error } = await adminClient
      .from('tournament_registrations')
      .insert(registrationData)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      console.error('Registration data:', JSON.stringify(registrationData, null, 2))
      return NextResponse.json(
        { error: 'Failed to create registration', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      registration: data,
      message: 'Registration created successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 