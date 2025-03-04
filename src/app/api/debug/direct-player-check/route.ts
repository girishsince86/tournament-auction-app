import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('[DEBUG API] Starting direct player check');
        const url = new URL(request.url);
        const tournamentId = url.searchParams.get('tournamentId');
        console.log('[DEBUG API] Tournament ID:', tournamentId);
        
        if (!tournamentId) {
            console.log('[DEBUG API] Missing tournamentId parameter');
            return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
        }

        const supabase = createRouteHandlerClient({ cookies });
        console.log('[DEBUG API] Checking authentication');
        
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('[DEBUG API] Authentication error:', authError);
            return NextResponse.json({ error: 'Authentication error', details: authError }, { status: 401 });
        }
        
        if (!session) {
            console.error('[DEBUG API] No session found');
            return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
        }
        
        console.log('[DEBUG API] User authenticated:', session.user.id);

        // Direct query for all players in the tournament
        console.log('[DEBUG API] Fetching all players for tournament');
        const { data: allPlayers, error: allPlayersError } = await supabase
            .from('players')
            .select('*')
            .eq('tournament_id', tournamentId);

        if (allPlayersError) {
            console.error('[DEBUG API] Error fetching players:', allPlayersError);
            return NextResponse.json({ error: 'Failed to fetch players', details: allPlayersError }, { status: 500 });
        }
        
        console.log('[DEBUG API] Found', allPlayers?.length || 0, 'players for tournament');

        // Direct query for UNALLOCATED players
        console.log('[DEBUG API] Fetching UNALLOCATED players');
        const { data: unallocatedPlayers, error: unallocatedError } = await supabase
            .from('players')
            .select('*')
            .eq('tournament_id', tournamentId)
            .eq('status', 'UNALLOCATED');

        if (unallocatedError) {
            console.error('[DEBUG API] Error fetching unallocated players:', unallocatedError);
            return NextResponse.json({ error: 'Failed to fetch unallocated players', details: unallocatedError }, { status: 500 });
        }
        
        console.log('[DEBUG API] Found', unallocatedPlayers?.length || 0, 'UNALLOCATED players');

        // Check if the tournament ID exists
        console.log('[DEBUG API] Checking if tournament exists');
        const { data: tournament, error: tournamentError } = await supabase
            .from('tournaments')
            .select('id, name')
            .eq('id', tournamentId)
            .single();

        if (tournamentError) {
            console.error('[DEBUG API] Error fetching tournament:', tournamentError);
            return NextResponse.json({ 
                error: 'Failed to fetch tournament', 
                details: tournamentError,
                message: 'Tournament may not exist with this ID'
            }, { status: 500 });
        }
        
        console.log('[DEBUG API] Tournament found:', tournament?.name);

        // Check if there are any players with the exact tournament ID
        const exactMatchCount = allPlayers?.filter(p => p.tournament_id === tournamentId).length || 0;
        console.log('[DEBUG API] Players with exact tournament ID match:', exactMatchCount);

        // Get status distribution
        const statusDistribution = allPlayers?.reduce((acc, player) => {
            const status = player.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        console.log('[DEBUG API] Returning response');
        return NextResponse.json({
            tournament: tournament || null,
            player_counts: {
                total: allPlayers?.length || 0,
                unallocated: unallocatedPlayers?.length || 0,
                exact_tournament_match: exactMatchCount,
                status_distribution: statusDistribution
            },
            sample_players: allPlayers?.slice(0, 5).map(p => ({
                id: p.id,
                name: p.name,
                status: p.status,
                tournament_id: p.tournament_id
            })) || [],
            unallocated_players: unallocatedPlayers?.map(p => ({
                id: p.id,
                name: p.name,
                status: p.status,
                tournament_id: p.tournament_id,
                category_id: p.category_id
            })) || []
        });
    } catch (error) {
        console.error('[DEBUG API] Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', details: error },
            { status: 500 }
        );
    }
}

// Helper function to get table info (this would normally be a database function)
// You'll need to create this function in your Supabase database
/*
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text
    FROM 
        information_schema.columns c
    WHERE 
        c.table_name = table_name
    ORDER BY 
        c.ordinal_position;
END;
$$ LANGUAGE plpgsql;
*/ 