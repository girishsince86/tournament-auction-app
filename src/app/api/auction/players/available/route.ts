import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

        // First, get category IDs for this tournament
        console.log('[API] Fetching category IDs for tournament');
        const { data: categoryData, error: categoryError } = await supabase
            .from('player_categories')
            .select('id')
            .eq('tournament_id', tournamentId);

        if (categoryError) {
            console.error('[API] Error fetching category IDs:', categoryError);
            return NextResponse.json({ error: 'Failed to fetch category IDs' }, { status: 500 });
        }

        const categoryIds = categoryData?.map(cat => cat.id) || [];
        console.log('[API] Category IDs for tournament:', categoryIds);

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
                profile_image_url
            `)
            .in('category_id', categoryIds)
            .in('status', ['AVAILABLE', 'UNALLOCATED']);

        if (playersError) {
            console.error('[API] Error fetching players:', playersError);
            return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
        }

        // DEBUG: Log status counts
        const statusCounts = players?.reduce((acc, player) => {
            const status = player.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};
        console.log('[API] Player status counts:', statusCounts);

        // DEBUG: Log UNALLOCATED players
        const unallocatedPlayers = players?.filter(player => player.status === 'UNALLOCATED') || [];
        console.log('[API] UNALLOCATED players count:', unallocatedPlayers.length);
        if (unallocatedPlayers.length > 0) {
            console.log('[API] UNALLOCATED players:', unallocatedPlayers.map(p => ({ id: p.id, name: p.name })));
        }

        // Filter out players that are already in queue
        const availablePlayers = players?.filter(player => 
            !queuePlayerIds.includes(player.id)
        ) || [];

        // DEBUG: Log filtered UNALLOCATED players
        const filteredUnallocatedPlayers = availablePlayers?.filter(player => player.status === 'UNALLOCATED') || [];
        console.log('[API] Filtered UNALLOCATED players count:', filteredUnallocatedPlayers.length);
        if (filteredUnallocatedPlayers.length > 0) {
            console.log('[API] Filtered UNALLOCATED players:', filteredUnallocatedPlayers.map(p => ({ id: p.id, name: p.name })));
        }

        // Get categories for these players
        const { data: categories, error: categoriesError } = await supabase
            .from('player_categories')
            .select('id, name')
            .in('id', categoryIds);

        if (categoriesError) {
            console.error('[API] Error fetching categories:', categoriesError);
            // Continue without categories
        }

        // Create a map of category IDs to names
        const categoryMap = new Map();
        categories?.forEach(category => {
            categoryMap.set(category.id, category.name);
        });

        console.log('[API] Found players:', availablePlayers.length);
        
        // Clean up the response
        const cleanedPlayers = availablePlayers.map(player => ({
            id: player.id,
            name: player.name || 'Unknown',
            base_price: player.base_price || 0,
            skill_level: player.skill_level || '',
            status: player.status || 'UNKNOWN',
            player_position: player.player_position || '',
            category_id: player.category_id || '',
            category_name: categoryMap.get(player.category_id) || 'Unknown',
            profile_image_url: player.profile_image_url || ''
        }));

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