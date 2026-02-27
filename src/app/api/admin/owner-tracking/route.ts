import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/supabase'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.email?.endsWith('@pbel.in')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Get all team owners from the master list
    const { data: teamOwners, error: ownersError } = await adminClient
      .from('team_owners')
      .select('id, email, name, auth_user_id, team_id')
      .order('name')

    if (ownersError) {
      console.error('Error fetching team owners:', ownersError)
      return NextResponse.json({ error: 'Failed to fetch team owners' }, { status: 500 })
    }

    // Get all team owner profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from('team_owner_profiles')
      .select('id, user_id, first_name, last_name, profile_image_url, bio, sports_background, updated_at')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // Get all teams
    const { data: teams, error: teamsError } = await adminClient
      .from('teams')
      .select('id, name, tournament_id, owner_name')

    if (teamsError) {
      console.error('Error fetching teams:', teamsError)
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // Build a lookup: auth_user_id -> profile
    const profilesByUserId = new Map(
      (profiles || []).map(p => [p.user_id, p])
    )

    // Build a lookup: team_id -> team
    const teamsById = new Map(
      (teams || []).map(t => [t.id, t])
    )

    // Combine into a single tracking view
    const tracking = (teamOwners || []).map(owner => {
      const profile = owner.auth_user_id
        ? profilesByUserId.get(owner.auth_user_id)
        : null
      const team = owner.team_id
        ? teamsById.get(owner.team_id)
        : null

      return {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        signed_up: !!owner.auth_user_id,
        profile_completed: !!profile,
        profile_name: profile ? `${profile.first_name} ${profile.last_name}` : null,
        profile_has_image: !!profile?.profile_image_url,
        profile_has_bio: !!profile?.bio,
        profile_has_background: !!profile?.sports_background,
        profile_updated_at: profile?.updated_at || null,
        team_assigned: !!owner.team_id,
        team_name: team?.name || null,
        team_id: owner.team_id,
      }
    })

    // Summary counts
    const summary = {
      total: tracking.length,
      signed_up: tracking.filter(t => t.signed_up).length,
      profile_completed: tracking.filter(t => t.profile_completed).length,
      team_assigned: tracking.filter(t => t.team_assigned).length,
    }

    return NextResponse.json({ tracking, summary })
  } catch (error) {
    console.error('Owner tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
