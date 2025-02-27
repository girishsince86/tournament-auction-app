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

        // Get basic team information
        const { data: teams, error } = await supabase
            .from('teams')
            .select(`
                id,
                name,
                initial_budget,
                remaining_budget,
                team_owners (
                    id,
                    name,
                    email
                )
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

        // Get player counts for each team
        const playerCountPromises = teams.map(async (team) => {
            const { count, error: countError } = await supabase
                .from('auction_rounds')
                .select('*', { count: 'exact', head: true })
                .eq('winning_team_id', team.id)
                .eq('tournament_id', tournamentId);
                
            if (countError) {
                console.error(`Error fetching player count for team ${team.id}:`, countError);
                return 0;
            }
            
            return count || 0;
        });

        const playerCounts = await Promise.all(playerCountPromises);

        // Transform the response with owner name and actual player count
        const transformedTeams = teams.map((team, index) => {
            // Get the first team owner's name or use 'No Owner' as fallback
            const ownerName = team.team_owners && team.team_owners.length > 0 
                ? team.team_owners[0].name 
                : 'No Owner';
            
            return {
                id: team.id,
                name: team.name,
                owner_id: team.team_owners && team.team_owners.length > 0 ? team.team_owners[0].id : null,
                owner_name: ownerName,
                initial_budget: team.initial_budget,
                remaining_budget: team.remaining_budget,
                total_spent: team.initial_budget - team.remaining_budget,
                players_count: playerCounts[index]
            };
        });

        return NextResponse.json({ teams: transformedTeams });
    } catch (err) {
        console.error('Teams API error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 