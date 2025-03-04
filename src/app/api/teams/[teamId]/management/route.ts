import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types/supabase';

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

async function checkTeamAccess(supabase: any, teamId: string, userId: string, userEmail: string) {
  // If user is admin, allow access
  if (isFullAdmin(userEmail)) {
    return true;
  }

  // If user is a team owner, check if they own this team
  if (isTeamOwner(userEmail)) {
    // Check if user is owner of this specific team
    const { data: teamOwner, error } = await supabase
      .from('team_owners')
      .select('*')
      .eq('team_id', teamId)
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) throw new Error(`Team ownership check failed: ${error.message}`);
    return !!teamOwner;
  }

  // Not admin or team owner
  return false;
}

export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { teamId } = params;

    // Validate UUID format
    if (!teamId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        { error: 'Invalid team ID format' },
        { status: 400 }
      );
    }

    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error('Authentication error');
    if (!session) throw new Error('Not authenticated');

    // Check authorization
    const hasAccess = await checkTeamAccess(supabase, teamId, session.user.id, session.user.email || '');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to access this team\'s data' },
        { status: 403 }
      );
    }

    // Get team basic info with owner details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        initial_budget,
        remaining_budget,
        min_players,
        max_players,
        tournament_id,
        team_owners (
          id,
          name,
          email,
          auth_user_id
        ),
        tournaments (
          id,
          name
        ),
        players:auction_rounds (
          id,
          final_points,
          player:players (
            id,
            name,
            player_position,
            skill_level,
            base_price,
            profile_image_url,
            phone_number,
            category:player_categories (*)
          )
        )
      `)
      .eq('id', teamId)
      .maybeSingle();

    if (teamError) {
      console.error('Team fetch error:', teamError);
      return NextResponse.json(
        { error: 'Team not found', details: teamError.message },
        { status: 404 }
      );
    }

    if (!team) {
      console.error('No team found with ID:', teamId);
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Transform the players data to a simpler format
    const players = team.players
      ?.filter(p => p.player) // Filter out any null player references
      .map(p => ({
        ...p.player,
        final_bid_points: p.final_points
      })) || [];

    // Calculate player counts by category
    let totalPlayers = players.length;
    let marqueePlayers = 0;
    let cappedPlayers = 0;
    let uncappedPlayers = 0;

    players.forEach((player: any) => {
      if (player.category) {
        switch (player.category.category_type) {
          case 'LEVEL_1':
            marqueePlayers++;
            break;
          case 'LEVEL_2':
            cappedPlayers++;
            break;
          case 'LEVEL_3':
            uncappedPlayers++;
            break;
        }
      }
    });

    // Get available players with preference status
    const { data: availablePlayers, error: playersError } = await supabase
      .from('players')
      .select(`
        *,
        category:player_categories!inner(*),
        is_preferred:preferred_players!left(
          id,
          max_bid,
          notes
        )
      `)
      .eq('status', 'AVAILABLE')
      .eq('category.tournament_id', team.tournament_id)
      .eq('preferred_players.team_id', teamId);

    if (playersError) {
      console.error('Players error:', playersError);
      return NextResponse.json(
        { error: 'Failed to fetch available players', details: playersError.message },
        { status: 500 }
      );
    }

    // Get tournament category requirements
    const { data: categoryRequirements, error: categoryError } = await supabase
      .from('player_categories')
      .select(`
        category_type,
        min_points,
        max_points,
        description
      `)
      .eq('tournament_id', team.tournament_id);

    if (categoryError) {
      return NextResponse.json(
        { error: 'Failed to fetch category requirements' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      team: {
        ...team,
        players,
        player_counts: {
          total: totalPlayers,
          marquee: marqueePlayers,
          capped: cappedPlayers,
          uncapped: uncappedPlayers
        }
      },
      categoryRequirements,
      available_players: availablePlayers.map(player => ({
        ...player,
        is_preferred: player.is_preferred?.length > 0
      }))
    });

  } catch (error) {
    console.error('Team management error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();

        // Validate request body
        const { requirements } = body;

        // Check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error('Authentication error');
        if (!session) throw new Error('Not authenticated');

        // Check authorization
        await checkTeamAccess(supabase, teamId, session.user.id, session.user.email || '');

        // Update requirements
        if (requirements) {
            for (const req of requirements) {
                await supabase
                    .from('team_combined_requirements')
                    .upsert({
                        team_id: teamId,
                        position: req.position,
                        skill_level: req.skill_level,
                        min_players: req.min_players,
                        max_players: req.max_players,
                        points_allocated: req.points_allocated,
                        updated_at: new Date().toISOString()
                    });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Team management API error:', error);
        return new NextResponse(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Internal server error'
            }),
            {
                status: error instanceof Error && error.message.includes('permission') ? 403 : 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
} 