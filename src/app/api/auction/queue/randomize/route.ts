import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

interface QueueItem {
    id: string;
    tournament_id: string;
    player_id: string;
    queue_position: number;
    is_processed: boolean;
}

// Randomize the order of players in the queue
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

        console.log('Randomizing queue for tournament:', tournamentId);

        // Get all unprocessed queue items for the tournament
        const { data: queueItems, error: fetchError } = await supabase
            .from('auction_queue')
            .select('id, tournament_id, player_id, queue_position, is_processed')
            .eq('tournament_id', tournamentId)
            .eq('is_processed', false)
            .order('queue_position', { ascending: true });

        if (fetchError) {
            console.error('Error fetching queue items:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch queue items', details: fetchError.message },
                { status: 500 }
            );
        }

        if (!queueItems || queueItems.length === 0) {
            return NextResponse.json(
                { error: 'No queue items found for randomization' },
                { status: 404 }
            );
        }

        // Shuffle the queue items
        const shuffledItems = [...queueItems].sort(() => Math.random() - 0.5);

        // Assign new positions
        const updatedItems = shuffledItems.map((item, index) => ({
            id: item.id,
            queue_position: index + 1
        }));

        // Update the queue positions in the database
        const updates = updatedItems.map(item => 
            supabase
                .from('auction_queue')
                .update({ queue_position: item.queue_position })
                .eq('id', item.id)
        );

        // Execute all updates
        await Promise.all(updates);

        console.log('Successfully randomized queue order');
        return NextResponse.json({ 
            success: true, 
            message: `Randomized ${updatedItems.length} queue items` 
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 