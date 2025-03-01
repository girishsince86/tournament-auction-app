import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

interface SessionUser {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
    raw_app_meta_data?: {
        role?: string;
        provider?: string;
        providers?: string[];
    };
    aud: string;
    role?: string;
}

// Batch add players to queue
export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        
        console.log('Starting batch POST request to auction queue');

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sessionUser = session.user as unknown as SessionUser;
        console.log('Session check passed:', {
            userId: sessionUser.id,
            userEmail: sessionUser.email
        });

        // Define allowed emails that can modify the queue
        const allowedEmails = [
            'gk@pbel.in',
            'admin@pbel.in',
            'amit@pbel.in',
            'vasu@pbel.in',
            'conductor@pbel.in',
            'team@pbel.in',
            'auction@pbel.in'
        ];
        
        // Check if user's email is in the allowed list
        const isAllowedEmail = sessionUser.email ? allowedEmails.includes(sessionUser.email) : false;
        
        console.log('User role check:', { 
            email: sessionUser.email,
            isAllowedEmail
        });

        if (!isAllowedEmail) {
            console.error('User is not authorized:', { 
                email: sessionUser.email
            });
            return NextResponse.json(
                { error: 'Only authorized users can modify the auction queue' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { tournamentId, playerIds } = body;

        console.log('Batch adding players to queue:', { 
            tournamentId, 
            playerCount: playerIds?.length || 0 
        });

        if (!tournamentId || !playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
            return NextResponse.json(
                { error: 'Tournament ID and player IDs array are required' },
                { status: 400 }
            );
        }

        // Get the current max position
        const { data: maxPositionData } = await supabase
            .from('auction_queue')
            .select('queue_position')
            .eq('tournament_id', tournamentId)
            .order('queue_position', { ascending: false })
            .limit(1);

        // Calculate the starting position
        const currentMaxPosition = maxPositionData && maxPositionData.length > 0 
            ? maxPositionData[0].queue_position 
            : 0;
        
        console.log('Current max position:', currentMaxPosition);

        // Check which players are already in the queue
        const { data: existingItems } = await supabase
            .from('auction_queue')
            .select('player_id')
            .eq('tournament_id', tournamentId)
            .eq('is_processed', false)
            .in('player_id', playerIds);

        const existingPlayerIds = existingItems ? existingItems.map(item => item.player_id) : [];
        console.log('Players already in queue:', existingPlayerIds);

        // Filter out players already in the queue
        const newPlayerIds = playerIds.filter(id => !existingPlayerIds.includes(id));
        console.log(`Adding ${newPlayerIds.length} new players to queue`);

        if (newPlayerIds.length === 0) {
            return NextResponse.json({
                message: 'All players are already in the queue',
                added: 0,
                skipped: playerIds.length,
                total: playerIds.length
            });
        }

        // Prepare batch insert data
        const insertData = newPlayerIds.map((playerId, index) => ({
            tournament_id: tournamentId,
            player_id: playerId,
            queue_position: currentMaxPosition + index + 1,
            is_processed: false
        }));

        // Insert all new players in a single batch operation
        const { data: insertedItems, error: insertError } = await supabase
            .from('auction_queue')
            .insert(insertData)
            .select('id, player_id');

        if (insertError) {
            console.error('Error adding players to queue:', insertError);
            return NextResponse.json(
                { error: 'Failed to add players to queue', details: insertError.message },
                { status: 500 }
            );
        }

        console.log('Successfully added players to queue:', {
            requested: playerIds.length,
            added: insertedItems?.length || 0,
            skipped: existingPlayerIds.length
        });

        return NextResponse.json({
            message: `Added ${insertedItems?.length || 0} players to queue`,
            added: insertedItems?.length || 0,
            skipped: existingPlayerIds.length,
            total: playerIds.length
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 