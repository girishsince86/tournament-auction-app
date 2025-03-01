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

        // Get player details
        const { data: player, error: playerFetchError } = await supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();

        if (playerFetchError || !player) {
            console.error('Error fetching player:', playerFetchError);
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        // Update player status to UNALLOCATED
        const { error: playerUpdateError } = await supabase
            .from('players')
            .update({
                status: 'UNALLOCATED',
                updated_at: new Date().toISOString()
            })
            .eq('id', playerId);

        if (playerUpdateError) {
            console.error('Error updating player:', playerUpdateError);
            return NextResponse.json(
                { error: 'Failed to update player status' },
                { status: 500 }
            );
        }

        // Create an auction round entry to record that the player was unallocated
        const { error: roundError } = await supabase
            .from('auction_rounds')
            .insert({
                player_id: playerId,
                starting_price: player.base_price,
                status: 'COMPLETED',
                start_time: new Date().toISOString(),
                end_time: new Date().toISOString(),
                is_manual_entry: true,
                conductor_notes: 'Player marked as UNALLOCATED - no bids received',
                auction_date: new Date().toISOString(),
                tournament_id: player.tournament_id || null
            });

        if (roundError) {
            console.error('Error creating auction round:', roundError);
            // We don't want to fail the entire operation if just the round creation fails
            // The player status has already been updated
        }

        return NextResponse.json({
            success: true,
            message: 'Player marked as UNALLOCATED successfully',
            player: player.name
        });
    } catch (error) {
        console.error('Error marking player as unallocated:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 