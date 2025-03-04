import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const tournamentId = url.searchParams.get('tournamentId');
        
        if (!tournamentId) {
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient({ cookies });
        
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get category IDs for this tournament
        const { data: categoryData, error: categoryError } = await supabase
            .from('player_categories')
            .select('id, name')
            .eq('tournament_id', tournamentId);

        if (categoryError) {
            return NextResponse.json({ error: 'Failed to fetch category IDs', details: categoryError }, { status: 500 });
        }

        const categoryIds = categoryData?.map(cat => cat.id) || [];
        
        // 2. Get players in queue to check if UNALLOCATED players are there
        const { data: queueData, error: queueError } = await supabase
            .from('auction_queue')
            .select('player_id')
            .eq('tournament_id', tournamentId);

        if (queueError) {
            return NextResponse.json({ error: 'Failed to fetch queue', details: queueError }, { status: 500 });
        }

        const queuePlayerIds = queueData?.map(item => item.player_id) || [];
        
        // 3. Get all players for this tournament regardless of category
        const { data: allPlayers, error: allPlayersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                status,
                category_id
            `)
            .eq('tournament_id', tournamentId);

        if (allPlayersError) {
            return NextResponse.json({ error: 'Failed to fetch players', details: allPlayersError }, { status: 500 });
        }
        
        // 4. Get players filtered by the category IDs
        const { data: filteredPlayers, error: filteredPlayersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                status,
                category_id
            `)
            .eq('tournament_id', tournamentId)
            .in('category_id', categoryIds);

        if (filteredPlayersError) {
            return NextResponse.json({ error: 'Failed to fetch filtered players', details: filteredPlayersError }, { status: 500 });
        }
        
        // 5. Get UNALLOCATED players
        const unallocatedPlayers = allPlayers?.filter(p => p.status === 'UNALLOCATED') || [];
        const unallocatedInCategories = filteredPlayers?.filter(p => p.status === 'UNALLOCATED') || [];
        const unallocatedInQueue = unallocatedPlayers.filter(p => queuePlayerIds.includes(p.id));
        
        // 6. Check which UNALLOCATED players would be excluded by category filter
        const excludedByCategory = unallocatedPlayers.filter(p => 
            !categoryIds.includes(p.category_id)
        );
        
        // 7. Check which UNALLOCATED players would be excluded by queue filter
        const excludedByQueue = unallocatedInCategories.filter(p => 
            queuePlayerIds.includes(p.id)
        );
        
        // 8. Calculate how many would remain after both filters
        const remainingAfterFilters = unallocatedInCategories.filter(p => 
            !queuePlayerIds.includes(p.id)
        );

        return NextResponse.json({
            tournament_id: tournamentId,
            categories: {
                count: categoryIds.length,
                ids: categoryIds,
                details: categoryData
            },
            queue: {
                count: queuePlayerIds.length,
                player_ids: queuePlayerIds
            },
            all_players: {
                count: allPlayers?.length || 0,
                status_counts: countByStatus(allPlayers || [])
            },
            unallocated: {
                total: unallocatedPlayers.length,
                in_categories: unallocatedInCategories.length,
                in_queue: unallocatedInQueue.length,
                excluded_by_category: {
                    count: excludedByCategory.length,
                    players: excludedByCategory.map(p => ({ id: p.id, name: p.name, category_id: p.category_id }))
                },
                excluded_by_queue: {
                    count: excludedByQueue.length,
                    players: excludedByQueue.map(p => ({ id: p.id, name: p.name }))
                },
                remaining_after_filters: {
                    count: remainingAfterFilters.length,
                    players: remainingAfterFilters.map(p => ({ id: p.id, name: p.name }))
                }
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', details: error },
            { status: 500 }
        );
    }
}

function countByStatus(players: any[]) {
    return players.reduce((acc, player) => {
        const status = player.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
} 