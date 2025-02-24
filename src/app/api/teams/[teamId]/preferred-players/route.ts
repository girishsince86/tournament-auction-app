import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

interface PreferredPlayerRow {
    id: string;
    team_id: string;
    player_id: string;
    priority: number;
    max_bid: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    players: {
        id: string;
        name: string;
        player_position: string;
        skill_level: string;
        base_price: number;
        status: string;
    };
}

interface FormattedPlayer {
    id: string;
    name: string;
    position: string;
    skill_level: string;
    base_price: number;
    priority: number;
    status: string;
    max_bid: number;
}

// Get preferred players for a team
export async function GET(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get preferred players with their details
        const { data: players, error: playersError } = await supabase
            .from('preferred_players')
            .select(`
                id,
                team_id,
                player_id,
                priority,
                max_bid,
                notes,
                created_at,
                updated_at,
                players!inner (
                    id,
                    name,
                    player_position,
                    skill_level,
                    base_price,
                    status
                )
            `)
            .eq('team_id', teamId)
            .order('priority');

        if (playersError) {
            console.error('Error fetching preferred players:', playersError);
            return NextResponse.json(
                { error: 'Failed to fetch preferred players' },
                { status: 500 }
            );
        }

        // Transform the response
        const formattedPlayers = (players as unknown as PreferredPlayerRow[]).map(item => ({
            id: item.players.id,
            name: item.players.name,
            position: item.players.player_position,
            skill_level: item.players.skill_level,
            base_price: item.players.base_price,
            priority: item.priority,
            status: item.players.status,
            max_bid: item.max_bid || Math.ceil(
                item.players.base_price * 
                (item.players.skill_level === 'COMPETITIVE_A' ? 1.2 :
                 item.players.skill_level === 'UPPER_INTERMEDIATE_BB' ? 1.1 :
                 item.players.skill_level === 'INTERMEDIATE_B' ? 1.0 :
                 0.9)
            )
        }));

        return NextResponse.json({ players: formattedPlayers });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// Add a player to preferred list
export async function POST(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();
        const { player_ids, max_bids } = body;

        console.log('Received request:', { teamId, player_ids, max_bids }); // Debug log

        if (!Array.isArray(player_ids) || player_ids.length === 0) {
            return NextResponse.json(
                { error: 'Player IDs are required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(max_bids) || max_bids.length !== player_ids.length) {
            return NextResponse.json(
                { error: 'Max bids array must match player IDs array' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        console.log('Session check:', { session: !!session, authError }); // Debug log

        if (authError) {
            console.error('Auth error:', authError); // Debug log
            return NextResponse.json(
                { error: 'Authentication error', details: authError.message },
                { status: 401 }
            );
        }

        if (!session) {
            return NextResponse.json(
                { error: 'No active session found. Please log in again.' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@pbel.in');

        if (!isAdmin) {
            // Only verify team ownership for non-admin users
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .select('owner_id')
                .eq('id', teamId)
                .single();

            if (teamError) {
                console.error('Team error:', teamError); // Debug log
                return NextResponse.json(
                    { error: 'Error fetching team', details: teamError.message },
                    { status: 500 }
                );
            }

            if (!team) {
                return NextResponse.json(
                    { error: 'Team not found' },
                    { status: 404 }
                );
            }

            if (team.owner_id !== session.user.id) {
                return NextResponse.json(
                    { error: 'You are not authorized to modify this team\'s preferences' },
                    { status: 403 }
                );
            }
        }

        // Create preference records for all selected players
        const preferencesToInsert = player_ids.map((player_id, index) => ({
            team_id: teamId,
            player_id,
            max_bid: max_bids[index],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        console.log('Inserting preferences:', preferencesToInsert); // Debug log

        const { data: preferences, error: preferenceError } = await supabase
            .from('preferred_players')
            .upsert(preferencesToInsert)
            .select();

        if (preferenceError) {
            console.error('Preference error:', preferenceError); // Debug log
            return NextResponse.json(
                { error: 'Failed to add preferred players', details: preferenceError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true,
            preferences 
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Update a player's preference
export async function PUT(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();
        const { player_id, max_bid_points, notes } = body;

        console.log('Updating preference:', { teamId, player_id, max_bid_points, notes }); // Debug log

        // Validate input
        if (!player_id || typeof max_bid_points !== 'number') {
            return NextResponse.json(
                { error: 'Invalid input: player_id and max_bid_points are required' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@pbel.in');

        // Verify team ownership if not admin
        if (!isAdmin) {
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .select('owner_id')
                .eq('id', teamId)
                .single();

            if (teamError || !team) {
                return NextResponse.json(
                    { error: 'Team not found' },
                    { status: 404 }
                );
            }

            if (team.owner_id !== session.user.id) {
                return NextResponse.json(
                    { error: 'You do not have permission to modify this team\'s preferences' },
                    { status: 403 }
                );
            }
        }

        // Get player details for validation
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('base_price, status')
            .eq('id', player_id)
            .single();

        if (playerError || !player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        // Validate max bid is not less than base price
        if (max_bid_points < player.base_price) {
            return NextResponse.json(
                { error: `Maximum bid cannot be less than base price (${player.base_price})` },
                { status: 400 }
            );
        }

        // Check if preference already exists
        const { data: existingPref, error: prefError } = await supabase
            .from('preferred_players')
            .select('id')
            .eq('team_id', teamId)
            .eq('player_id', player_id)
            .maybeSingle();

        if (prefError) {
            console.error('Error checking existing preference:', prefError);
            return NextResponse.json(
                { error: 'Failed to check existing preference', details: prefError.message },
                { status: 500 }
            );
        }

        // Prepare the preference data
        const preferenceData: {
            team_id: string;
            player_id: string;
            max_bid: number;
            notes: string | null;
            priority: number;
            updated_at: string;
            created_at?: string;
        } = {
            team_id: teamId,
            player_id,
            max_bid: max_bid_points,
            notes: notes || null,
            priority: 1, // Default priority
            updated_at: new Date().toISOString()
        };

        // If preference doesn't exist, add created_at
        if (!existingPref) {
            preferenceData.created_at = new Date().toISOString();
        }

        // Update or insert the preference
        const { data: preference, error: upsertError } = await supabase
            .from('preferred_players')
            .upsert(preferenceData, {
                onConflict: 'team_id,player_id'
            })
            .select()
            .single();

        if (upsertError) {
            console.error('Error upserting preference:', upsertError);
            return NextResponse.json(
                { error: 'Failed to update preference', details: upsertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true,
            preference 
        });

    } catch (error) {
        console.error('Error in team preferences:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const playerId = request.nextUrl.searchParams.get('playerId');

        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('Auth error:', authError);
            return NextResponse.json(
                { error: 'Authentication error', details: authError.message },
                { status: 401 }
            );
        }

        if (!session) {
            return NextResponse.json(
                { error: 'No active session found. Please log in again.' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@pbel.in');

        if (!isAdmin) {
            // Only verify team ownership for non-admin users
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .select('owner_id')
                .eq('id', teamId)
                .single();

            if (teamError) {
                console.error('Team error:', teamError);
                return NextResponse.json(
                    { error: 'Error fetching team', details: teamError.message },
                    { status: 500 }
                );
            }

            if (!team) {
                return NextResponse.json(
                    { error: 'Team not found' },
                    { status: 404 }
                );
            }

            if (team.owner_id !== session.user.id) {
                return NextResponse.json(
                    { error: 'You are not authorized to modify this team\'s preferences' },
                    { status: 403 }
                );
            }
        }

        // Delete player preference
        const { error: deleteError } = await supabase
            .from('preferred_players')
            .delete()
            .eq('team_id', teamId)
            .eq('player_id', playerId);

        if (deleteError) {
            console.error('Error deleting preference:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete preference', details: deleteError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 