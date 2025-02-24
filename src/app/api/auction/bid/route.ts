import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const body = await request.json();
        const { tournamentId, playerId, teamId, amount } = body;

        // Validate required fields
        if (!tournamentId || !playerId || !teamId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Start a transaction
        const { data: client } = await supabase.from('teams').select('*').eq('id', teamId).single();
        
        if (!client) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        if (client.remaining_points < amount) {
            return NextResponse.json(
                { error: 'Insufficient points' },
                { status: 400 }
            );
        }

        if (client.current_players >= client.max_players) {
            return NextResponse.json(
                { error: 'Team has reached maximum player limit' },
                { status: 400 }
            );
        }

        // Update auction round
        const { data: round, error: roundError } = await supabase
            .from('auction_rounds')
            .update({
                final_points: amount,
                winning_team_id: teamId,
                status: 'COMPLETED',
                updated_at: new Date().toISOString()
            })
            .eq('tournament_id', tournamentId)
            .eq('player_id', playerId)
            .eq('status', 'ACTIVE')
            .select()
            .single();

        if (roundError) {
            console.error('Error updating auction round:', roundError);
            return NextResponse.json(
                { error: 'Failed to update auction round' },
                { status: 500 }
            );
        }

        // Update team's remaining points and player count
        const { error: teamError } = await supabase
            .from('teams')
            .update({
                remaining_points: client.remaining_points - amount,
                current_players: client.current_players + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', teamId);

        if (teamError) {
            console.error('Error updating team:', teamError);
            return NextResponse.json(
                { error: 'Failed to update team' },
                { status: 500 }
            );
        }

        // Update player's team
        const { error: playerError } = await supabase
            .from('players')
            .update({
                current_team_id: teamId,
                updated_at: new Date().toISOString()
            })
            .eq('id', playerId);

        if (playerError) {
            console.error('Error updating player:', playerError);
            return NextResponse.json(
                { error: 'Failed to update player' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, round });
    } catch (err) {
        console.error('Bid API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 