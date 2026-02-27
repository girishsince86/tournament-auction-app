import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Update queue item position
export async function PATCH(
    request: NextRequest,
    { params }: { params: { queueItemId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const queueItemId = params.queueItemId;
        const { position } = await request.json();

        if (typeof position !== 'number') {
            return NextResponse.json(
                { error: 'Position must be a number' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('auction_queue')
            .update({ queue_position: position })
            .eq('id', queueItemId);

        if (error) {
            console.error('Error updating queue position:', error);
            return NextResponse.json(
                { error: 'Failed to update queue position', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
