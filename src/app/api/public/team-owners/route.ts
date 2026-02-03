import { NextRequest, NextResponse } from 'next/server'
import { getServiceRoleSupabaseClient } from '@/lib/supabase/public-api'
import { enrichTeamOwnerProfile } from '@/lib/utils/team-owners-data'

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceRoleSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 503 })
    }
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get('teamId')
    const debug = searchParams.get('debug') === 'true'
    
    // We only need to fetch minimal data from the database
    // Most content will come from the JSON file
    let query = supabase
      .from('team_owner_profiles')
      .select(`
        id,
        user_id,
        team_id,
        first_name,
        last_name,
        profile_image_url,
        created_at,
        updated_at,
        teams (
          id,
          name
        )
      `)
    
    // If teamId is provided, filter by that team
    if (teamId) {
      query = query.eq('team_id', teamId)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Public team owner profiles fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team owner profiles' },
        { status: 500 }
      )
    }
    
    if (debug) {
      console.log('Database profiles before enrichment:', JSON.stringify(data, null, 2))
    }
    
    // Transform the data to include team_name and replace with data from JSON file
    const profiles = data?.map(profile => {
      // Create a base profile with team_name
      let teamName: string | undefined = undefined;
      
      // Safely extract team name
      if (profile.teams && Array.isArray(profile.teams) && profile.teams.length > 0) {
        teamName = profile.teams[0].name;
      }
      
      const transformedProfile = {
        ...profile,
        team_name: teamName,
        teams: undefined // Remove the teams object from the response
      };
      
      // Replace profile data with data from the JSON file
      const enrichedProfile = enrichTeamOwnerProfile(transformedProfile);
      
      if (debug && enrichedProfile === transformedProfile) {
        console.log(`No JSON data found for: ${profile.first_name} ${profile.last_name}`);
      }
      
      return enrichedProfile;
    }) || [];
    
    if (debug) {
      console.log('Profiles after enrichment:', JSON.stringify(profiles, null, 2))
    }
    
    return NextResponse.json({ data: profiles })
  } catch (error) {
    console.error('Public team owner profiles fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 