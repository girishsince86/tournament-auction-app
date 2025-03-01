import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Delete queue item and set player status back to AVAILABLE
export async function DELETE(
    request: NextRequest,
    { params }: { params: { queueItemId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const queueItemId = params.queueItemId;

        if (!queueItemId) {
            return NextResponse.json(
                { error: 'Queue item ID is required' },
                { status: 400 }
            );
        }

        console.log('Removing queue item:', queueItemId);

        // First, get the player ID from the queue item
        const { data: queueItem, error: fetchError } = await supabase
            .from('auction_queue')
            .select('player_id')
            .eq('id', queueItemId)
            .single();

        if (fetchError) {
            console.error('Error fetching queue item:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch queue item', details: fetchError.message },
                { status: 500 }
            );
        }

        if (!queueItem) {
            return NextResponse.json(
                { error: 'Queue item not found' },
                { status: 404 }
            );
        }

        // Delete the queue item
        const { error: deleteError } = await supabase
            .from('auction_queue')
            .delete()
            .eq('id', queueItemId);

        if (deleteError) {
            console.error('Error deleting queue item:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete queue item', details: deleteError.message },
                { status: 500 }
            );
        }

        // Update player status to AVAILABLE
        const { error: updateError } = await supabase
            .from('players')
            .update({ status: 'AVAILABLE' })
            .eq('id', queueItem.player_id);

        if (updateError) {
            console.error('Error updating player status:', updateError);
            return NextResponse.json(
                { error: 'Failed to update player status', details: updateError.message },
                { status: 500 }
            );
        }

        console.log('Successfully removed player from queue and set status to AVAILABLE');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 