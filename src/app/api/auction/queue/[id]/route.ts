import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Delete queue item
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { id } = params;

        // Get the item to be deleted
        const { data: itemToDelete } = await supabase
            .from('auction_queue')
            .select('tournament_id, queue_position')
            .eq('id', id)
            .single();

        if (!itemToDelete) {
            return NextResponse.json(
                { error: 'Queue item not found' },
                { status: 404 }
            );
        }

        // Delete the item
        const { error: deleteError } = await supabase
            .from('auction_queue')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting queue item:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete queue item' },
                { status: 500 }
            );
        }

        // Update positions of remaining items
        const { error: updateError } = await supabase
            .from('auction_queue')
            .update({ 
                queue_position: `queue_position - 1`
            })
            .eq('tournament_id', itemToDelete.tournament_id)
            .gt('queue_position', itemToDelete.queue_position);

        if (updateError) {
            console.error('Error updating queue positions:', updateError);
            return NextResponse.json(
                { error: 'Failed to update queue positions' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Queue item deleted successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// Update queue item position
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { id } = params;
        const body = await request.json();
        const { position } = body;

        if (!position) {
            return NextResponse.json(
                { error: 'Position is required' },
                { status: 400 }
            );
        }

        // Get current queue item
        const { data: currentItem } = await supabase
            .from('auction_queue')
            .select('tournament_id, queue_position')
            .eq('id', id)
            .single();

        if (!currentItem) {
            return NextResponse.json(
                { error: 'Queue item not found' },
                { status: 404 }
            );
        }

        // Begin transaction
        const { error: updateError } = await supabase.rpc('update_queue_positions', {
            p_queue_id: id,
            p_tournament_id: currentItem.tournament_id,
            p_old_position: currentItem.queue_position,
            p_new_position: position
        });

        if (updateError) {
            console.error('Error updating queue positions:', updateError);
            return NextResponse.json(
                { error: 'Failed to update queue positions' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Queue position updated successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 