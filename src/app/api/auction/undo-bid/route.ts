import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { handleApiError, handleAuthError, handleValidationError } from '@/lib/api-utils';

export async function POST(request: Request) {
    const path = '/api/auction/undo-bid';

    try {
        const supabase = createRouteHandlerClient({ cookies });

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return handleAuthError(authError?.message || 'Unauthorized', path);
        }

        const body = await request.json();
        const { playerId } = body;

        if (!playerId) {
            return handleValidationError({ playerId: 'Player ID is required' }, path);
        }

        // Call the atomic RPC — player unallocation, budget restoration, and
        // round status update all happen in a single Postgres transaction with
        // row-level locks to prevent race conditions.
        const { data, error } = await supabase.rpc('undo_auction_bid', {
            p_player_id: playerId,
        });

        if (error) {
            console.error('undo_auction_bid RPC error:', error);

            // Map Postgres exceptions to appropriate HTTP responses
            const message = error.message || '';
            if (message.includes('not allocated')) {
                return handleValidationError({ player: message }, path);
            }
            if (message.includes('No completed auction round')) {
                return handleValidationError({ player: message }, path);
            }
            if (message.includes('not found')) {
                return NextResponse.json({ error: message }, { status: 404 });
            }

            return handleApiError(error, path);
        }

        return NextResponse.json({
            success: true,
            message: 'Player allocation undone successfully',
            player: data.player_name,
            team: data.team_name,
            points_restored: data.points_restored,
        });
    } catch (err) {
        console.error('Undo bid API error:', err);
        return handleApiError(err, path);
    }
}
