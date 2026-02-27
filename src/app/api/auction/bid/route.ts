import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { handleApiError, handleAuthError, handleValidationError } from '@/lib/api-utils';

export async function POST(request: Request) {
    const path = '/api/auction/bid';

    try {
        const supabase = createRouteHandlerClient({ cookies });

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return handleAuthError(authError?.message || 'Unauthorized', path);
        }

        const body = await request.json();
        const { tournamentId, playerId, teamId, amount } = body;
        const sportCategory = body.sportCategory || 'VOLLEYBALL_OPEN_MEN';

        // Validate required fields
        const validationErrors: Record<string, string> = {};
        if (!tournamentId) validationErrors.tournamentId = 'Tournament ID is required';
        if (!playerId) validationErrors.playerId = 'Player ID is required';
        if (!teamId) validationErrors.teamId = 'Team ID is required';
        if (amount === undefined || amount === null) validationErrors.amount = 'Bid amount is required';

        if (Object.keys(validationErrors).length > 0) {
            return handleValidationError(validationErrors, path);
        }

        // Validate amount is a positive integer
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            return handleValidationError({ amount: 'Bid amount must be a positive number' }, path);
        }

        if (!Number.isInteger(amount)) {
            return handleValidationError({ amount: 'Bid amount must be a whole number' }, path);
        }

        // Call the atomic RPC — all validation, budget deduction, and player
        // allocation happen inside a single Postgres transaction with row-level
        // locks (SELECT FOR UPDATE) to prevent race conditions.
        const { data, error } = await supabase.rpc('record_auction_bid', {
            p_tournament_id: tournamentId,
            p_player_id: playerId,
            p_team_id: teamId,
            p_amount: amount,
            p_sport_category: sportCategory,
        });

        if (error) {
            console.error('record_auction_bid RPC error:', error);

            // Map Postgres exceptions to appropriate HTTP responses
            const message = error.message || '';
            if (message.includes('Insufficient budget')) {
                return handleValidationError({ amount: message }, path);
            }
            if (message.includes('maximum player limit')) {
                return handleValidationError({ team: message }, path);
            }
            if (message.includes('already allocated')) {
                return handleValidationError({ player: message }, path);
            }
            if (message.includes('not found')) {
                return NextResponse.json({ error: message }, { status: 404 });
            }
            if (message.includes('must be a positive number')) {
                return handleValidationError({ amount: message }, path);
            }

            return handleApiError(error, path);
        }

        return NextResponse.json({ success: true, round: data });
    } catch (err) {
        console.error('Bid API error:', err);
        return handleApiError(err, path);
    }
}
