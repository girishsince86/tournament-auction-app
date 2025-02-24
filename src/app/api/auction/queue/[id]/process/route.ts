import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Mark queue item as processed
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { id } = params;

        const { error } = await supabase
            .from('auction_queue')
            .update({ is_processed: true })
            .eq('id', id);

        if (error) {
            console.error('Error marking queue item as processed:', error);
            return NextResponse.json(
                { error: 'Failed to mark queue item as processed' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Queue item marked as processed successfully' });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 