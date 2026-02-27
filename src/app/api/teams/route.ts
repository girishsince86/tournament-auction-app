import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tournamentId = searchParams.get('tournamentId');
        const sportCategory = searchParams.get('sportCategory') || 'VOLLEYBALL_OPEN_MEN';

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
                max_players,
                team_owners (
                    id,
                    name,
                    email
                )
            `)
            .eq('tournament_id', tournamentId)
            .eq('sport_category', sportCategory)
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

        // Get player counts for each team with category breakdown
        const playerDetailsPromises = teams.map(async (team) => {
            // Get all players for the team
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select(`
                    id,
                    category_id
                `)
                .eq('current_team_id', team.id);
                
            if (playersError) {
                console.error(`Error fetching players for team ${team.id}:`, playersError);
                return {
                    total: 0,
                    marquee: 0,
                    capped: 0,
                    uncapped: 0
                };
            }
            
            // Count players by category
            const totalPlayers = players?.length || 0;
            
            // Define category IDs for marquee, capped, and uncapped players
            const marqueeId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
            const cappedId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
            const uncappedId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
            
            // Count players in each category
            const marqueeCount = players?.filter(p => p.category_id === marqueeId).length || 0;
            const cappedCount = players?.filter(p => p.category_id === cappedId).length || 0;
            const uncappedCount = players?.filter(p => p.category_id === uncappedId).length || 0;
            
            return {
                total: totalPlayers,
                marquee: marqueeCount,
                capped: cappedCount,
                uncapped: uncappedCount
            };
        });

        const playerDetails = await Promise.all(playerDetailsPromises);

        // Transform the response with owner name and player counts
        const transformedTeams = teams.map((team, index) => {
            // Get the first team owner's name or use 'No Owner' as fallback
            const ownerName = team.team_owners && team.team_owners.length > 0 
                ? team.team_owners[0].name 
                : 'No Owner';
            
            const totalPlayers = playerDetails[index].total;
            const totalSpent = team.initial_budget - team.remaining_budget;
            const avgPlayerCost = totalPlayers > 0 ? totalSpent / totalPlayers : 0;
            
            return {
                id: team.id,
                name: team.name,
                owner_id: team.team_owners && team.team_owners.length > 0 ? team.team_owners[0].id : null,
                owner_name: ownerName,
                initial_budget: team.initial_budget,
                remaining_budget: team.remaining_budget,
                total_spent: totalSpent,
                avg_player_cost: avgPlayerCost,
                max_players: team.max_players,
                players_count: playerDetails[index].total,
                marquee_players: playerDetails[index].marquee,
                capped_players: playerDetails[index].capped,
                uncapped_players: playerDetails[index].uncapped
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