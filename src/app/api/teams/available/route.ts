import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
  // Define known admin emails (these will have full admin access)
  const adminEmails = [
    'girish@pbel.in', // Super admin
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
    console.log('Fetching available teams. Is admin:', isAdmin)

    try {
      // Get teams that don't have profiles yet using left join
      let query = supabase
        .from('teams')
        .select(`
          id,
          name,
          team_owners!inner (
            auth_user_id
          ),
          team_owner_profiles!left (
            id
          )
        `)
        .is('team_owner_profiles.id', null)

      // If not admin, only show teams where the user is the owner
      if (!isAdmin) {
        query = query.eq('team_owners.auth_user_id', session.user.id)
      }

      const { data: teams, error: teamsError } = await query

      if (teamsError) {
        console.error('Database query error:', {
          message: teamsError.message,
          details: teamsError.details,
          hint: teamsError.hint,
          code: teamsError.code
        })
        return NextResponse.json(
          { error: `Database query failed: ${teamsError.message}` },
          { status: 500 }
        )
      }

      // Transform the data to only include id and name
      const availableTeams = teams?.map(team => ({
        id: team.id,
        name: team.name
      })) || []

      console.log('Successfully fetched available teams:', availableTeams.length)
      return NextResponse.json({ data: availableTeams })
    } catch (dbError) {
      console.error('Database operation error:', dbError)
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/teams/available:', {
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