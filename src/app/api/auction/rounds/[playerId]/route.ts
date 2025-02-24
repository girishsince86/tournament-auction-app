import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { playerId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { playerId } = params;
        const body = await request.json();
        const { tournamentId, finalPoints, winningTeamId, status } = body;

        console.log('Received auction round request:', {
            playerId,
            tournamentId,
            finalPoints,
            winningTeamId,
            status,
        });

        // Validate required fields
        if (!tournamentId || !finalPoints || !winningTeamId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Authenticate user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('User authenticated:', {
            userId: user.id,
            email: user.email,
        });

        // Check if player is already allocated
        const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('status')
            .eq('id', playerId)
            .single();

        if (playerError) {
            return NextResponse.json(
                { error: 'Failed to check player status' },
                { status: 500 }
            );
        }

        if (playerData.status === 'ALLOCATED') {
            // Get existing allocation
            const { data: existingAllocation, error: allocationError } = await supabase
                .from('auction_rounds')
                .select('id, status, winning_team_id')
                .eq('player_id', playerId)
                .eq('tournament_id', tournamentId)
                .single();

            if (allocationError) {
                console.error('Error checking existing allocation:', allocationError);
                return NextResponse.json(
                    { error: 'Failed to check existing allocation' },
                    { status: 500 }
                );
            }

            // Update player status to AVAILABLE
            const { error: updateError } = await supabase
                .from('players')
                .update({ status: 'AVAILABLE' })
                .eq('id', playerId);

            if (updateError) {
                console.error('Error updating player status:', updateError);
                return NextResponse.json(
                    { error: 'Failed to update player status' },
                    { status: 500 }
                );
            }
        }

        // Check team budget
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('remaining_budget')
            .eq('id', winningTeamId)
            .single();

        if (teamError) {
            return NextResponse.json(
                { error: 'Failed to check team budget' },
                { status: 500 }
            );
        }

        if (teamData.remaining_budget < finalPoints) {
            return NextResponse.json(
                { 
                    error: 'Insufficient budget',
                    details: {
                        required: finalPoints,
                        available: teamData.remaining_budget
                    }
                },
                { status: 400 }
            );
        }

        // Create auction round
        const { data: roundData, error: roundError } = await supabase
            .rpc('process_auction_allocation', {
                p_player_id: playerId,
                p_team_id: winningTeamId,
                p_queue_item_id: null // This will be updated when queue integration is added
            });

        if (roundError) {
            console.error('Error creating auction round:', roundError);
            return NextResponse.json(
                { error: 'Failed to create auction round' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: roundData });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 