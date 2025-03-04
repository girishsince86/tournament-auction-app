import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { handleApiError, handleAuthError, handleValidationError, handleNotFoundError } from '@/lib/api-utils';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const path = '/api/auction/bid';
        
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return handleAuthError(authError?.message || 'Unauthorized', path);
        }
        
        const body = await request.json();
        const { tournamentId, playerId, teamId, amount } = body;

        // Validate required fields
        const validationErrors: Record<string, string> = {};
        if (!tournamentId) validationErrors.tournamentId = 'Tournament ID is required';
        if (!playerId) validationErrors.playerId = 'Player ID is required';
        if (!teamId) validationErrors.teamId = 'Team ID is required';
        if (amount === undefined) validationErrors.amount = 'Bid amount is required';
        
        if (Object.keys(validationErrors).length > 0) {
            return handleValidationError(validationErrors, path);
        }

        // Start a transaction
        const { data: client, error: clientError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();

        if (clientError) {
            console.error('Error fetching team:', clientError);
            return handleNotFoundError('team', path);
        }

        // Calculate current player count
        const { count: currentPlayerCount, error: countError } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('current_team_id', teamId);

        if (countError) {
            console.error('Error counting players:', countError);
            return handleApiError(countError, path);
        }

        // Determine which budget field to use (remaining_points or remaining_budget)
        const remainingBudget = client.remaining_points !== undefined && client.remaining_points !== null 
            ? client.remaining_points 
            : (client.remaining_budget || 0);
        
        if (remainingBudget < amount) {
            return handleValidationError({ amount: 'Insufficient points' }, path);
        }

        // Check if max_players is defined
        const maxPlayers = client.max_players || 12; // Default to 12 if not defined
        if ((currentPlayerCount ?? 0) >= maxPlayers) {
            return handleValidationError({ team: 'Team has reached maximum player limit' }, path);
        }

        // Get player details to get base price
        const { data: player, error: playerError } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();

        if (playerError || !player) {
            console.error('Error fetching player:', playerError);
            return handleNotFoundError('player', path);
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
            return handleApiError(findError, path);
        }

        let round;
        
        if (!existingRound) {
            // No round exists, create a new one
            console.log('No auction round found, creating a new one');
            try {
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
                    return handleApiError(createError, path);
                }
                
                round = newRound;
            } catch (createErr) {
                console.error('Exception creating auction round:', createErr);
                return handleApiError(createErr, path);
            }
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
                    return handleApiError(updateError, path);
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
        try {
            // Determine which field to update (remaining_points or remaining_budget)
            const updateField = client.remaining_points !== undefined && client.remaining_points !== null
                ? { remaining_points: client.remaining_points - amount }
                : { remaining_budget: client.remaining_budget - amount };
                
            const { error: teamError } = await supabase
                .from('teams')
                .update({
                    ...updateField,
                    updated_at: new Date().toISOString()
                })
                .eq('id', teamId);

            if (teamError) {
                console.error('Error updating team:', teamError);
                return handleApiError(teamError, path);
            }
        } catch (teamUpdateErr) {
            console.error('Exception updating team:', teamUpdateErr);
            return handleApiError(teamUpdateErr, path);
        }

        // Update player's team
        try {
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
                return handleApiError(playerUpdateError, path);
            }
        } catch (playerUpdateErr) {
            console.error('Exception updating player:', playerUpdateErr);
            return handleApiError(playerUpdateErr, path);
        }

        return NextResponse.json({ success: true, round });
    } catch (err) {
        console.error('Bid API error:', err);
        return handleApiError(err, '/api/auction/bid');
    }
} 