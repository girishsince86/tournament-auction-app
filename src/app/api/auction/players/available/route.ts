import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('[API] Starting available players fetch');
        const url = new URL(request.url);
        const tournamentId = url.searchParams.get('tournamentId');
        const sportCategory = url.searchParams.get('sportCategory') || 'VOLLEYBALL_OPEN_MEN';
        console.log('[API] Tournament ID:', tournamentId, 'Sport Category:', sportCategory);

        if (!tournamentId) {
            console.error('[API] Missing tournamentId parameter');
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient({ cookies });
        console.log('[API] Checking authentication');
        
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('[API] Authentication error:', authError);
            return NextResponse.json({ error: 'Authentication error', details: authError }, { status: 401 });
        }
        
        if (!session) {
            console.error('[API] No session found');
            return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
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
            .select('id, name')
            .eq('tournament_id', tournamentId);

        if (categoryError) {
            console.error('[API] Error fetching category IDs:', categoryError);
            return NextResponse.json({ error: 'Failed to fetch category IDs' }, { status: 500 });
        }

        const categoryIds = categoryData?.map(cat => cat.id) || [];
        console.log('[API] Category IDs for tournament:', categoryIds);

        // IMPORTANT: Direct check for UNALLOCATED players first
        console.log('[API] Direct check for UNALLOCATED players');
        const { data: unallocatedCheck, error: unallocatedCheckError } = await supabase
            .from('players')
            .select('id, name, status')
            .eq('tournament_id', tournamentId)
            .eq('status', 'UNALLOCATED');
            
        if (unallocatedCheckError) {
            console.error('[API] Error in direct UNALLOCATED check:', unallocatedCheckError);
        } else {
            console.log('[API] Direct UNALLOCATED check found:', unallocatedCheck?.length || 0, 'players');
            if (unallocatedCheck && unallocatedCheck.length > 0) {
                console.log('[API] Sample UNALLOCATED players:', unallocatedCheck.slice(0, 3));
            }
        }

        // IMPORTANT: Get AVAILABLE players
        console.log('[API] Fetching AVAILABLE players for sport:', sportCategory);
        const { data: availablePlayers, error: availablePlayersError } = await supabase
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
                tournament_id
            `)
            .eq('tournament_id', tournamentId)
            .eq('status', 'AVAILABLE')
            .eq('sport_category', sportCategory);

        if (availablePlayersError) {
            console.error('[API] Error fetching AVAILABLE players:', availablePlayersError);
            return NextResponse.json({ error: 'Failed to fetch AVAILABLE players' }, { status: 500 });
        }

        // IMPORTANT: Get UNALLOCATED players
        console.log('[API] Fetching UNALLOCATED players for sport:', sportCategory);
        const { data: unallocatedPlayers, error: unallocatedPlayersError } = await supabase
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
                tournament_id
            `)
            .eq('tournament_id', tournamentId)
            .eq('status', 'UNALLOCATED')
            .eq('sport_category', sportCategory);

        if (unallocatedPlayersError) {
            console.error('[API] Error fetching UNALLOCATED players:', unallocatedPlayersError);
            return NextResponse.json({ error: 'Failed to fetch UNALLOCATED players' }, { status: 500 });
        }

        // Combine both sets of players
        const players = [...(availablePlayers || []), ...(unallocatedPlayers || [])];
        
        console.log('[API] Combined players count:', players.length);
        console.log('[API] AVAILABLE players count:', availablePlayers?.length || 0);
        console.log('[API] UNALLOCATED players count:', unallocatedPlayers?.length || 0);

        // DEBUG: Log raw players data
        if (players.length > 0) {
            console.log('[API] Sample raw players:', players.slice(0, 3).map(p => ({
                id: p.id,
                name: p.name,
                status: p.status,
                category_id: p.category_id,
                tournament_id: p.tournament_id
            })));
        } else {
            console.warn('[API] No players found for tournament ID:', tournamentId);
            
            // Additional check - try without status filter
            console.log('[API] Checking for ANY players with this tournament ID');
            const { data: anyPlayers, error: anyPlayersError } = await supabase
                .from('players')
                .select('id, name, status, tournament_id')
                .eq('tournament_id', tournamentId);
                
            if (anyPlayersError) {
                console.error('[API] Error checking for any players:', anyPlayersError);
            } else {
                console.log('[API] Found', anyPlayers?.length || 0, 'players of any status');
                if (anyPlayers && anyPlayers.length > 0) {
                    console.log('[API] Status distribution:', anyPlayers.reduce((acc, p) => {
                        acc[p.status] = (acc[p.status] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>));
                    
                    // Log a few sample players
                    console.log('[API] Sample players of any status:', anyPlayers.slice(0, 5).map(p => ({
                        id: p.id,
                        name: p.name,
                        status: p.status,
                        tournament_id: p.tournament_id
                    })));
                }
            }
            
            // Check if the tournament exists
            const { data: tournament, error: tournamentError } = await supabase
                .from('tournaments')
                .select('id, name')
                .eq('id', tournamentId)
                .single();
                
            if (tournamentError) {
                console.error('[API] Error checking tournament:', tournamentError);
            } else {
                console.log('[API] Tournament exists:', tournament);
            }
        }

        // DEBUG: Log status counts
        const statusCounts = players.reduce((acc, player) => {
            const status = player.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        console.log('[API] Player status counts:', statusCounts);

        // Filter out players that are already in queue
        const availablePlayersNotInQueue = players.filter(player => 
            !queuePlayerIds.includes(player.id)
        );

        // DEBUG: Log filtered UNALLOCATED players
        const filteredUnallocatedPlayers = availablePlayersNotInQueue.filter(player => player.status === 'UNALLOCATED');
        console.log('[API] Filtered UNALLOCATED players count:', filteredUnallocatedPlayers.length);
        if (filteredUnallocatedPlayers.length > 0) {
            console.log('[API] Sample filtered UNALLOCATED players:', filteredUnallocatedPlayers.slice(0, 3).map(p => ({ id: p.id, name: p.name, category_id: p.category_id })));
        }

        // Create a map of category IDs to names
        const categoryMap = new Map();
        categoryData?.forEach(category => {
            categoryMap.set(category.id, category.name);
        });

        console.log('[API] Final players count:', availablePlayersNotInQueue.length);
        
        // Clean up the response
        const cleanedPlayers = availablePlayersNotInQueue.map(player => ({
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

        console.log('[API] Returning cleaned players data, count:', cleanedPlayers.length);
        return NextResponse.json({ players: cleanedPlayers });
    } catch (error) {
        console.error('[API] Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 