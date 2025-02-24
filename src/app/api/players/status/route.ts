import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const searchParams = request.nextUrl.searchParams;
        const playerId = searchParams.get('playerId');
        const playerName = searchParams.get('playerName');

        if (!playerId && !playerName) {
            return NextResponse.json(
                { error: 'Either player ID or name is required' },
                { status: 400 }
            );
        }

        let query = supabase
            .from('players')
            .select(`
                id,
                name,
                status,
                current_team_id,
                base_price,
                skill_level,
                player_position
            `);

        if (playerId) {
            query = query.eq('id', playerId);
        } else if (playerName) {
            query = query.eq('name', playerName);
        }

        const { data: player, error } = await query.single();

        if (error) {
            console.error('Error fetching player:', error);
            return NextResponse.json(
                { error: 'Failed to fetch player details' },
                { status: 500 }
            );
        }

        if (!player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        // If player has a team, get team details
        let team = null;
        if (player.current_team_id) {
            const { data: teamData, error: teamError } = await supabase
                .from('teams')
                .select('id, name')
                .eq('id', player.current_team_id)
                .single();

            if (!teamError && teamData) {
                team = teamData;
            }
        }

        return NextResponse.json({
            player: {
                ...player,
                team
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 