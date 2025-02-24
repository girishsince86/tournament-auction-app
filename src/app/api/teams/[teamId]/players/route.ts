import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/types/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;

        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get players with their auction details
        const { data: players, error } = await supabase
            .from('players')
            .select(`
                id,
                name,
                player_position,
                skill_level,
                base_price,
                auction_rounds (
                    final_points,
                    created_at
                )
            `)
            .eq('current_team_id', teamId)
            .order('name');

        if (error) {
            console.error('Error fetching team players:', error);
            return NextResponse.json(
                { error: 'Failed to fetch team players' },
                { status: 500 }
            );
        }

        // Format the response
        const formattedPlayers = players.map(player => ({
            id: player.id,
            name: player.name,
            player_position: player.player_position,
            skill_level: player.skill_level,
            base_price: player.base_price,
            auction_details: player.auction_rounds?.[0] ? {
                final_points: player.auction_rounds[0].final_points,
                auction_date: player.auction_rounds[0].created_at
            } : undefined
        }));

        return NextResponse.json({
            players: formattedPlayers
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 