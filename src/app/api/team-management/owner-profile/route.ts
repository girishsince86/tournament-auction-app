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
  'naveen@pbel.in',
  'anish@pbel.in',
  'subhamitra@pbel.in',
  'raju@pbel.in',
  'saravana@pbel.in',
  'praveenraj@pbel.in',
  'romesh@pbel.in',
  'srinivas@pbel.in',
  'sraveen@pbel.in'
];

// Helper function to check if a user is a team owner
const isTeamOwner = (email?: string): boolean => {
  return email ? teamOwnerEmails.includes(email) : false;
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
        .select(`
          *,
          teams (
            id,
            name
          )
        `)

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

      // Transform the data to include team_name
      const profiles = data.map(profile => ({
        ...profile,
        team_name: profile.teams?.name,
        teams: undefined // Remove the teams object from the response
      }))

      console.log('Successfully fetched profiles:', profiles.length)
      return NextResponse.json({ data: profiles })
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
        .eq('team_id', data.team_id)
        .eq('auth_user_id', session.user.id)
        .single()

      if (teamError || !teamOwner) {
        console.error('Team ownership verification failed:', teamError)
        return NextResponse.json(
          { error: 'You do not have permission to create a profile for this team' },
          { status: 403 }
        )
      }
    }

    // Check if a profile already exists for this team
    const { data: existingProfile, error: existingError } = await supabase
      .from('team_owner_profiles')
      .select('*')
      .eq('team_id', data.team_id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'A profile already exists for this team' },
        { status: 400 }
      )
    }

    const profile = {
      ...data,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('Creating profile with data:', profile)

    const { data: savedProfile, error: insertError } = await supabase
      .from('team_owner_profiles')
      .insert([profile])
      .select(`
        *,
        teams (
          id,
          name
        )
      `)
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

    // Transform the response to include team_name
    const responseProfile = {
      ...savedProfile,
      team_name: savedProfile.teams?.name,
      teams: undefined
    }

    return NextResponse.json({ data: responseProfile })
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
        .eq('team_id', data.team_id)
        .eq('auth_user_id', session.user.id)
        .single()

      if (teamError || !teamOwner) {
        console.error('Team ownership verification failed:', teamError)
        return NextResponse.json(
          { error: 'You do not have permission to update this profile' },
          { status: 403 }
        )
      }
    }

    const profile = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedProfile, error } = await supabase
      .from('team_owner_profiles')
      .update(profile)
      .eq('team_id', data.team_id)
      .select(`
        *,
        teams (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Transform the response to include team_name
    const responseProfile = {
      ...updatedProfile,
      team_name: updatedProfile.teams?.name,
      teams: undefined
    }

    return NextResponse.json({ data: responseProfile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 