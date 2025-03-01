import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await request.json();
        const { playerId } = body;

        // Validate required fields
        if (!playerId) {
            return NextResponse.json(
                { error: 'Missing player ID' },
                { status: 400 }
            );
        }

        // Get player details to find their team
        const { data: player, error: playerFetchError } = await supabase
            .from('players')
            .select('*, teams:current_team_id(*)')
            .eq('id', playerId)
            .single();

        if (playerFetchError || !player) {
            console.error('Error fetching player:', playerFetchError);
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        if (!player.current_team_id) {
            return NextResponse.json(
                { error: 'Player is not allocated to any team' },
                { status: 400 }
            );
        }

        const teamId = player.current_team_id;
        
        // Get the latest auction round for this player
        const { data: auctionRound, error: roundError } = await supabase
            .from('auction_rounds')
            .select('*')
            .eq('player_id', playerId)
            .eq('winning_team_id', teamId)
            .eq('status', 'COMPLETED')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (roundError) {
            console.error('Error fetching auction round:', roundError);
            return NextResponse.json(
                { error: 'Failed to find auction record' },
                { status: 500 }
            );
        }

        // Get team details
        const { data: team, error: teamFetchError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();

        if (teamFetchError || !team) {
            console.error('Error fetching team:', teamFetchError);
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        // Update player to remove team allocation
        const { error: playerUpdateError } = await supabase
            .from('players')
            .update({
                current_team_id: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', playerId);

        if (playerUpdateError) {
            console.error('Error updating player:', playerUpdateError);
            return NextResponse.json(
                { error: 'Failed to update player' },
                { status: 500 }
            );
        }

        // Update team's remaining points and player count
        const { error: teamUpdateError } = await supabase
            .from('teams')
            .update({
                remaining_points: team.remaining_points + auctionRound.final_points,
                updated_at: new Date().toISOString()
            })
            .eq('id', teamId);

        if (teamUpdateError) {
            console.error('Error updating team:', teamUpdateError);
            return NextResponse.json(
                { error: 'Failed to update team' },
                { status: 500 }
            );
        }

        // Update auction round status
        const { error: roundUpdateError } = await supabase
            .from('auction_rounds')
            .update({
                status: 'UNDONE',
                updated_at: new Date().toISOString()
            })
            .eq('id', auctionRound.id);

        if (roundUpdateError) {
            console.error('Error updating auction round:', roundUpdateError);
            return NextResponse.json(
                { error: 'Failed to update auction round' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Player allocation undone successfully',
            player: player.name,
            team: team.name,
            points_restored: auctionRound.final_points
        });
    } catch (err) {
        console.error('Undo bid API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 