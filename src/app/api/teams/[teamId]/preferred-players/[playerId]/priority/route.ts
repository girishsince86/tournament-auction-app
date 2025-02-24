import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { teamId: string; playerId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId, playerId } = params;
        const body = await request.json();
        const { direction } = body;

        // Validate request
        if (!direction || !['up', 'down'].includes(direction)) {
            return NextResponse.json(
                { error: 'Invalid direction' },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get current priority
        const { data: current, error: currentError } = await supabase
            .from('preferred_players')
            .select('priority')
            .eq('team_id', teamId)
            .eq('player_id', playerId)
            .single();

        if (currentError) {
            console.error('Error fetching current priority:', currentError);
            return NextResponse.json(
                { error: 'Failed to fetch current priority' },
                { status: 500 }
            );
        }

        const currentPriority = current.priority;
        const newPriority = direction === 'up' ? currentPriority - 1 : currentPriority + 1;

        // Get player at target priority
        const { data: target, error: targetError } = await supabase
            .from('preferred_players')
            .select('player_id, priority')
            .eq('team_id', teamId)
            .eq('priority', newPriority)
            .single();

        if (targetError && targetError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching target priority:', targetError);
            return NextResponse.json(
                { error: 'Failed to fetch target priority' },
                { status: 500 }
            );
        }

        // Begin transaction
        const { error: updateError } = await supabase.rpc('swap_preferred_player_priorities', {
            p_team_id: teamId,
            p_player_id_1: playerId,
            p_player_id_2: target?.player_id || null,
            p_priority_1: currentPriority,
            p_priority_2: newPriority
        });

        if (updateError) {
            console.error('Error updating priorities:', updateError);
            return NextResponse.json(
                { error: 'Failed to update priorities' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Priority updated successfully'
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 