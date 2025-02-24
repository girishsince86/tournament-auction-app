import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tournamentId = searchParams.get('tournamentId');

        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        const supabase = createRouteHandlerClient<Database>({ cookies });

        // Get basic team information without player counts for now
        const { data: teams, error } = await supabase
            .from('teams')
            .select(`
                id,
                name,
                initial_budget,
                remaining_budget
            `)
            .eq('tournament_id', tournamentId)
            .order('name');

        if (error) {
            console.error('Error fetching teams:', error);
            return NextResponse.json(
                { error: 'Failed to fetch teams' },
                { status: 500 }
            );
        }

        if (!teams) {
            return NextResponse.json({ teams: [] });
        }

        // Transform the response with a default players count
        const teamsWithDefaultCount = teams.map(team => ({
            id: team.id,
            name: team.name,
            initial_budget: team.initial_budget,
            remaining_budget: team.remaining_budget,
            total_spent: team.initial_budget - team.remaining_budget,
            players_count: 9 // Changed to 9 players per team
        }));

        return NextResponse.json({ teams: teamsWithDefaultCount });
    } catch (err) {
        console.error('Teams API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 