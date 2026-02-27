import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'
import { TeamOwnerProfile, TeamOwnerUpdateRequest } from '@/types/team-owner'

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
  // Define known admin emails (these will have full admin access)
  const adminEmails = [
    'gk@pbel.in', // Super admin
    'admin@pbel.in',  // Admin
    'amit@pbel.in',   // Admin
    'vasu@pbel.in'    // Admin
  ]; // Add all admin emails here
  return email ? adminEmails.includes(email) : false;
}

// Define explicit list of team owner emails
const teamOwnerEmails = [
  'bhupinder@pbel.in',
  'jawid@pbel.in',
  'surya@pbel.in',
  'romesh@pbel.in',
  'shiva@pbel.in',
  'shubhamitra@pbel.in',
  'vikram@pbel.in',
  'rajendra@pbel.in',
  'prateek@pbel.in',
  'naveen@pbel.in',
];

// Helper function to check if a user is a team owner
const isTeamOwner = (email?: string): boolean => {
  return email ? teamOwnerEmails.includes(email) : false;
}

// Only keep columns that actually exist in the team_owner_profiles table
// Note: production DB uses the original schema WITHOUT team_id or phone_number
const VALID_PROFILE_COLUMNS = new Set([
  'user_id', 'first_name', 'last_name', 'sports_background',
  'notable_achievements', 'team_role', 'contact_email', 'social_media',
  'profile_image_url', 'bio', 'created_at', 'updated_at',
])

function sanitizeProfileData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (VALID_PROFILE_COLUMNS.has(key) && value !== undefined) {
      sanitized[key] = value
    }
  }
  return sanitized
}

// Validation function for profile data
function validateProfileData(data: TeamOwnerUpdateRequest): { isValid: boolean; error?: string } {
  if (!data.first_name?.trim() || !data.last_name?.trim()) {
    return { isValid: false, error: 'First name and last name are required' }
  }

  if (!data.contact_email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
    return { isValid: false, error: 'Valid contact email is required' }
  }

  return { isValid: true }
}

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
      console.error('No session found')
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email;
    const isAdmin = isFullAdmin(userEmail);
    console.log('Attempting to fetch profiles. Is admin:', isAdmin)

    try {
      let query = supabase
        .from('team_owner_profiles')
        .select('*')

      // If not admin, only show profiles where user is the team owner
      if (!isAdmin) {
        query = query.eq('user_id', session.user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database query error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return NextResponse.json(
          { error: `Database query failed: ${error.message}` },
          { status: 500 }
        )
      }

      if (!data || data.length === 0) {
        console.log('No profiles found for user:', session.user.id)
        return NextResponse.json({ data: [] })
      }

      console.log('Successfully fetched profiles:', data.length)
      return NextResponse.json({ data })
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/team-management/owner-profile:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the current user's session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json() as TeamOwnerUpdateRequest

    // Validate profile data
    const validation = validateProfileData(data)
    if (!validation.isValid) {
      console.error('Validation error:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const userEmail = session.user.email;
    const isAdmin = isFullAdmin(userEmail);
    console.log('Attempting to create profile. Is admin:', isAdmin)

    // Verify team ownership or admin status
    if (!isAdmin) {
      const { data: teamOwner, error: teamError } = await supabase
        .from('team_owners')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .limit(1)
        .single()

      if (teamError || !teamOwner) {
        console.error('Team ownership verification failed:', teamError)
        return NextResponse.json(
          { error: 'You do not have permission to create a profile' },
          { status: 403 }
        )
      }
    }

    // Check if a profile already exists for this user
    const { data: existingProfile, error: existingError } = await supabase
      .from('team_owner_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'A profile already exists for this user' },
        { status: 400 }
      )
    }

    const profile = sanitizeProfileData({
      ...data,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    console.log('Creating profile with data:', profile)

    const { data: savedProfile, error: insertError } = await supabase
      .from('team_owner_profiles')
      .insert([profile])
      .select('*')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to create profile' },
        { status: 500 }
      )
    }

    if (!savedProfile) {
      console.error('No profile returned after insert')
      return NextResponse.json(
        { error: 'Failed to create profile - no data returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: savedProfile })
  } catch (error) {
    console.error('Unexpected error in profile creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the current user's session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json() as TeamOwnerUpdateRequest

    // Validate profile data
    const validation = validateProfileData(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const userEmail = session.user.email;
    const isAdmin = isFullAdmin(userEmail);
    console.log('Attempting to update profile. Is admin:', isAdmin)

    // Verify team ownership or admin status
    if (!isAdmin) {
      const { data: teamOwner, error: teamError } = await supabase
        .from('team_owners')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .limit(1)
        .single()

      if (teamError || !teamOwner) {
        console.error('Team ownership verification failed:', teamError)
        return NextResponse.json(
          { error: 'You do not have permission to update this profile' },
          { status: 403 }
        )
      }
    }

    const profile = sanitizeProfileData({
      ...data,
      updated_at: new Date().toISOString(),
    })

    const { data: updatedProfile, error } = await supabase
      .from('team_owner_profiles')
      .update(profile)
      .eq('user_id', session.user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updatedProfile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 