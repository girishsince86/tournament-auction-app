import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types/supabase'
import { enrichTeamOwnerProfile } from '@/lib/utils/team-owners-data'

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic'

// Create a Supabase client with the service role key for public access
// This allows bypassing RLS policies for public data
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const debug = request.nextUrl.searchParams.get('debug') === 'true'
    
    if (!id) {
      return NextResponse.json(
        { error: 'Team owner ID is required' },
        { status: 400 }
      )
    }
    
    // We only need to fetch minimal data from the database
    // Most content will come from the JSON file
    const { data: profile, error } = await supabase
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
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Public team owner profile fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team owner profile' },
        { status: 500 }
      )
    }
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Team owner profile not found' },
        { status: 404 }
      )
    }
    
    if (debug) {
      console.log('Database profile before enrichment:', JSON.stringify(profile, null, 2))
    }
    
    // Transform the data to include team_name
    let teamName: string | undefined = undefined;
    
    // Safely extract team name
    if (profile.teams && Array.isArray(profile.teams) && profile.teams.length > 0) {
      teamName = profile.teams[0].name;
    }
    
    const transformedProfile = {
      ...profile,
      team_name: teamName,
      teams: undefined // Remove the teams object from the response
    }
    
    // Replace profile data with data from the JSON file
    const enrichedProfile = enrichTeamOwnerProfile(transformedProfile)
    
    if (debug) {
      console.log('Profile after enrichment:', JSON.stringify(enrichedProfile, null, 2))
      
      if (enrichedProfile === transformedProfile) {
        console.log(`No JSON data found for: ${profile.first_name} ${profile.last_name}`);
      }
    }
    
    return NextResponse.json({ data: enrichedProfile })
  } catch (error) {
    console.error('Public team owner profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 