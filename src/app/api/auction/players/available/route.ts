import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        console.log('[API] Starting available players fetch');
        const url = new URL(request.url);
        const tournamentId = url.searchParams.get('tournamentId');
        console.log('[API] Tournament ID:', tournamentId);

        if (!tournamentId) {
            console.error('[API] Missing tournamentId parameter');
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient({ cookies });
        console.log('[API] Checking authentication');
        
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('[API] Authentication error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('[API] User authenticated:', session.user.id);

        // First get players in queue to exclude them
        console.log('[API] Fetching queue players to exclude');
        const { data: queueData, error: queueError } = await supabase
            .from('auction_queue')
            .select('player_id')
            .eq('tournament_id', tournamentId);

        if (queueError) {
            console.error('[API] Error fetching queue:', queueError);
            return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
        }

        const queuePlayerIds = queueData?.map(item => item.player_id) || [];
        console.log('[API] Players in queue:', queuePlayerIds);

        // Get available players for this tournament
        console.log('[API] Fetching available players');
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                base_price,
                skill_level,
                status,
                player_position,
                category_id,
                profile_image_url,
                player_categories!inner (
                    tournament_id
                )
            `)
            .eq('player_categories.tournament_id', tournamentId)
            .in('status', ['AVAILABLE', 'UNALLOCATED'])
            .not('id', 'in', `(${queuePlayerIds.join(',')})`)
            .order('name');

        if (playersError) {
            console.error('[API] Error fetching players:', playersError);
            return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
        }

        console.log('[API] Found players:', players?.length);
        
        // Clean up the response
        const cleanedPlayers = players?.map(player => ({
            id: player.id,
            name: player.name,
            base_price: player.base_price,
            skill_level: player.skill_level,
            status: player.status,
            position: player.player_position,
            profile_image_url: player.profile_image_url
        })) || [];

        console.log('[API] Returning cleaned players data');
        return NextResponse.json({ players: cleanedPlayers });
    } catch (error) {
        console.error('[API] Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 