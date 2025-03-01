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
        const { tournamentId, playerId, teamId, amount } = body;

        // Validate required fields
        if (!tournamentId || !playerId || !teamId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Start a transaction
        const { data: client, error: clientError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();

        if (clientError) {
            console.error('Error fetching team:', clientError);
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        // Calculate current player count
        const { count: currentPlayerCount, error: countError } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('current_team_id', teamId);

        if (countError) {
            console.error('Error counting players:', countError);
            return NextResponse.json(
                { error: 'Failed to validate team player count' },
                { status: 500 }
            );
        }

        const remainingBudget = client.remaining_points || client.remaining_budget;
        
        if (remainingBudget < amount) {
            return NextResponse.json(
                { error: 'Insufficient points' },
                { status: 400 }
            );
        }

        if ((currentPlayerCount ?? 0) >= client.max_players) {
            return NextResponse.json(
                { error: 'Team has reached maximum player limit' },
                { status: 400 }
            );
        }

        // Get player details to get base price
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();

        if (playerError || !player) {
            console.error('Error fetching player:', playerError);
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        // First, check if an active auction round exists for this player
        const { data: existingRound, error: findError } = await supabase
            .from('auction_rounds')
            .select('*')
            .eq('tournament_id', tournamentId)
            .eq('player_id', playerId)
            .maybeSingle();

        if (findError) {
            console.error('Error finding auction round:', findError);
            return NextResponse.json(
                { error: 'Failed to check auction round' },
                { status: 500 }
            );
        }

        let round;
        
        if (!existingRound) {
            // No round exists, create a new one
            console.log('No auction round found, creating a new one');
            const { data: newRound, error: createError } = await supabase
                .from('auction_rounds')
                .insert({
                    tournament_id: tournamentId,
                    player_id: playerId,
                    final_points: amount,
                    starting_price: player.base_price || 0,
                    winning_team_id: teamId,
                    status: 'COMPLETED',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating auction round:', createError);
                return NextResponse.json(
                    { error: 'Failed to create auction round' },
                    { status: 500 }
                );
            }
            
            round = newRound;
        } else {
            // Update the existing round
            console.log('Updating existing auction round:', existingRound.id);
            try {
                const { data: updatedRound, error: updateError } = await supabase
                    .from('auction_rounds')
                    .update({
                        final_points: amount,
                        winning_team_id: teamId,
                        status: 'COMPLETED',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingRound.id)
                    .select();

                if (updateError) {
                    console.error('Error updating auction round:', updateError);
                    return NextResponse.json(
                        { error: 'Failed to update auction round' },
                        { status: 500 }
                    );
                }
                
                // If no rows were returned, use the existing round data
                round = updatedRound?.[0] || existingRound;
            } catch (updateErr) {
                console.error('Error updating auction round:', updateErr);
                // Fall back to using the existing round data
                round = existingRound;
            }
        }

        // Update team's remaining points
        const { error: teamError } = await supabase
            .from('teams')
            .update({
                remaining_budget: client.remaining_points ? client.remaining_points - amount : client.remaining_budget - amount,
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
        const { error: playerUpdateError } = await supabase
            .from('players')
            .update({
                current_team_id: teamId,
                status: 'ALLOCATED',
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

        return NextResponse.json({ success: true, round });
    } catch (err) {
        console.error('Bid API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 