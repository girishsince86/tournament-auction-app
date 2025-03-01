import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Mark queue item as processed
export async function PATCH(
    request: NextRequest,
    { params }: { params: { queueItemId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const queueItemId = params.queueItemId;

        console.log('Marking queue item as processed:', queueItemId);

        const { error } = await supabase
            .from('auction_queue')
            .update({ is_processed: true })
            .eq('id', queueItemId);

        if (error) {
            console.error('Error marking queue item as processed:', error);
            return NextResponse.json(
                { error: 'Failed to mark queue item as processed', details: error.message },
                { status: 500 }
            );
        }

        console.log('Successfully marked queue item as processed');
        return NextResponse.json({ success: true, message: 'Queue item marked as processed successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 