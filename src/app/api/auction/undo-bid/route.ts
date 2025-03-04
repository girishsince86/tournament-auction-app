import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { handleApiError, handleAuthError, handleValidationError, handleNotFoundError } from '@/lib/api-utils';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const path = '/api/auction/undo-bid';
        
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return handleAuthError(authError?.message || 'Unauthorized', path);
        }
        
        const body = await request.json();
        const { playerId } = body;

        // Validate required fields
        if (!playerId) {
            return handleValidationError({ playerId: 'Player ID is required' }, path);
        }

        // Get player details to find their team
        const { data: player, error: playerFetchError } = await supabase
            .from('players')
            .select('*, teams:current_team_id(*)')
            .eq('id', playerId)
            .single();

        if (playerFetchError || !player) {
            console.error('Error fetching player:', playerFetchError);
            return handleNotFoundError('player', path);
        }

        if (!player.current_team_id) {
            return handleValidationError({ player: 'Player is not allocated to any team' }, path);
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
            return handleApiError(roundError, path);
        }

        // Get team details
        const { data: team, error: teamFetchError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();

        if (teamFetchError || !team) {
            console.error('Error fetching team:', teamFetchError);
            return handleNotFoundError('team', path);
        }

        try {
            // Update player to remove team allocation
            const { error: playerUpdateError } = await supabase
                .from('players')
                .update({
                    current_team_id: null,
                    status: 'AVAILABLE',
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

        try {
            // Determine which field to update (remaining_points or remaining_budget)
            const pointsToRestore = auctionRound.final_points || 0;
            const updateField = team.remaining_points !== undefined && team.remaining_points !== null
                ? { remaining_points: team.remaining_points + pointsToRestore }
                : { remaining_budget: team.remaining_budget + pointsToRestore };
                
            // Update team's remaining points and player count
            const { error: teamUpdateError } = await supabase
                .from('teams')
                .update({
                    ...updateField,
                    updated_at: new Date().toISOString()
                })
                .eq('id', teamId);

            if (teamUpdateError) {
                console.error('Error updating team:', teamUpdateError);
                return handleApiError(teamUpdateError, path);
            }
        } catch (teamUpdateErr) {
            console.error('Exception updating team:', teamUpdateErr);
            return handleApiError(teamUpdateErr, path);
        }

        try {
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
                return handleApiError(roundUpdateError, path);
            }
        } catch (roundUpdateErr) {
            console.error('Exception updating auction round:', roundUpdateErr);
            return handleApiError(roundUpdateErr, path);
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
        return handleApiError(err, '/api/auction/undo-bid');
    }
} 