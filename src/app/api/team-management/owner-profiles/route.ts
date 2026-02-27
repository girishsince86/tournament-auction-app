import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic'

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

export async function GET(request: NextRequest) {
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

    // Check if user is admin using the explicit admin list
    const userEmail = session.user.email;
    const isAdmin = isFullAdmin(userEmail);
    const isOwner = isTeamOwner(userEmail);

    let query = supabase
      .from('team_owner_profiles')
      .select('*')

    // If not admin, only show the user's own profile
    if (!isAdmin) {
      query = query.eq('user_id', session.user.id)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    // Fetch team names for profiles that have team_id
    const teamIds = (data || []).map(p => p.team_id).filter(Boolean)
    let teamNames: Record<string, string> = {}
    if (teamIds.length > 0) {
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds)
      if (teams) {
        teamNames = Object.fromEntries(teams.map(t => [t.id, t.name]))
      }
    }

    // Transform the data to include team_name
    const profiles = (data || []).map(profile => ({
      ...profile,
      team_name: profile.team_id ? teamNames[profile.team_id] : undefined,
    }))

    return NextResponse.json({ data: profiles })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 