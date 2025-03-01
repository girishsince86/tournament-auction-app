import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Clear all players from the queue
export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        
        // Get tournament ID from request body
        const body = await request.json();
        const { tournamentId } = body;

        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        console.log('Clearing queue for tournament:', tournamentId);

        // Get all unprocessed queue items for the tournament
        const { data: queueItems, error: fetchError } = await supabase
            .from('auction_queue')
            .select('id, tournament_id, player_id, queue_position, is_processed')
            .eq('tournament_id', tournamentId)
            .eq('is_processed', false);

        if (fetchError) {
            console.error('Error fetching queue items:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch queue items', details: fetchError.message },
                { status: 500 }
            );
        }

        if (!queueItems || queueItems.length === 0) {
            return NextResponse.json(
                { message: 'No queue items found to clear' },
                { status: 200 }
            );
        }

        // Delete all unprocessed queue items for the tournament
        const { error: deleteError } = await supabase
            .from('auction_queue')
            .delete()
            .eq('tournament_id', tournamentId)
            .eq('is_processed', false);

        if (deleteError) {
            console.error('Error clearing queue items:', deleteError);
            return NextResponse.json(
                { error: 'Failed to clear queue items', details: deleteError.message },
                { status: 500 }
            );
        }

        console.log('Successfully cleared queue');
        return NextResponse.json({ 
            success: true, 
            message: `Cleared ${queueItems.length} queue items` 
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 