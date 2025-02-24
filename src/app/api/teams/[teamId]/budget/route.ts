import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types/supabase';

export const dynamic = 'force-dynamic';

// Get budget history and alerts
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

        // Get team data
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select(`
                *,
                tournament:tournament_id (
                    id,
                    name,
                    is_active
                )
            `)
            .eq('id', teamId)
            .single();

        if (teamError) {
            console.error('Error fetching team:', teamError);
            return NextResponse.json(
                { error: 'Failed to fetch team data', details: teamError.message },
                { status: 500 }
            );
        }

        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        // Get team players with better error handling
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select(`
                id,
                name,
                base_price,
                current_team_id,
                auction_rounds (
                    final_points
                )
            `)
            .eq('current_team_id', teamId);

        if (playersError) {
            console.error('Error fetching players:', playersError);
            return NextResponse.json(
                { error: 'Failed to fetch players data', details: playersError.message },
                { status: 500 }
            );
        }

        // Calculate budget metrics
        const totalSpent = players?.reduce((sum, player) => 
            sum + (player.auction_rounds[0]?.final_points || player.base_price), 0) || 0;
        
        const avgPlayerCost = players?.length ? Math.round(totalSpent / players.length) : 0;
        const budgetUtilization = Math.round((totalSpent / team.initial_budget) * 100);
        
        // Get tournament average metrics for comparison with better error handling
        const { data: tournamentTeams, error: tournamentError } = await supabase
            .from('teams')
            .select('id')
            .eq('tournament_id', team.tournament_id);

        if (tournamentError) {
            console.error('Error fetching tournament teams:', tournamentError);
            return NextResponse.json(
                { error: 'Failed to fetch tournament data', details: tournamentError.message },
                { status: 500 }
            );
        }

        // Get all players from tournament teams
        const { data: allTournamentPlayers, error: tournamentPlayersError } = await supabase
            .from('players')
            .select(`
                id,
                base_price,
                current_team_id,
                auction_rounds (
                    final_points
                )
            `)
            .in('current_team_id', tournamentTeams?.map(t => t.id) || []);

        if (tournamentPlayersError) {
            console.error('Error fetching tournament players:', tournamentPlayersError);
            return NextResponse.json(
                { error: 'Failed to fetch tournament players', details: tournamentPlayersError.message },
                { status: 500 }
            );
        }

        // Calculate tournament metrics
        const tournamentMetrics = (allTournamentPlayers || []).reduce((acc, player) => {
            const playerCost = player.auction_rounds[0]?.final_points || player.base_price;
            return {
                totalCost: acc.totalCost + playerCost,
                playerCount: acc.playerCount + 1
            };
        }, { totalCost: 0, playerCount: 0 });

        const tournamentAvgCost = tournamentMetrics?.playerCount ? 
            Math.round(tournamentMetrics.totalCost / tournamentMetrics.playerCount) : 0;

        // Calculate efficiency score (0-100)
        let efficiencyScore = 70; // Base score

        // Adjust based on budget utilization (optimal range 80-95%)
        if (budgetUtilization >= 80 && budgetUtilization <= 95) efficiencyScore += 15;
        else if (budgetUtilization > 95) efficiencyScore -= 5;
        else if (budgetUtilization < 60) efficiencyScore -= 10;

        // Adjust based on average cost comparison
        if (tournamentAvgCost > 0) {
            const costDiff = Math.abs(avgPlayerCost - tournamentAvgCost) / tournamentAvgCost;
            if (costDiff <= 0.1) efficiencyScore += 15;
            else if (costDiff <= 0.2) efficiencyScore += 10;
            else if (costDiff > 0.3) efficiencyScore -= 5;
        }

        efficiencyScore = Math.min(100, Math.max(0, efficiencyScore));

        // Generate alerts
        const alerts = [];
        const remainingPercent = (team.remaining_budget / team.initial_budget) * 100;

        if (remainingPercent < 10) {
            alerts.push({
                type: 'error',
                message: 'Critical budget level. Careful consideration needed for further acquisitions.'
            });
        } else if (remainingPercent < 20) {
            alerts.push({
                type: 'warning',
                message: 'Low budget remaining. Consider strategic player selections.'
            });
        }

        if (team.tournament?.is_active && remainingPercent > 50) {
            alerts.push({
                type: 'info',
                message: 'High budget availability. Consider early strategic acquisitions.'
            });
        }

        return NextResponse.json({
            metrics: {
                efficiency_score: efficiencyScore,
                avg_player_cost: avgPlayerCost,
                budget_utilization: budgetUtilization,
                tournament_comparison: {
                    avg_team_size: Math.round(tournamentMetrics?.playerCount / (tournamentTeams?.length || 1)),
                    avg_player_cost: tournamentAvgCost,
                    avg_budget_utilization: budgetUtilization,
                    highest_budget_utilization: 100,
                    lowest_budget_utilization: 0
                }
            },
            alerts
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// Adjust team budget (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { teamId } = params;
        const body = await request.json();
        const { adjustment, reason } = body;

        // Check if user is authenticated and is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!user.email?.endsWith('@pbel.in')) {
            return NextResponse.json(
                { error: 'Only administrators can adjust team budgets' },
                { status: 403 }
            );
        }

        // Validate adjustment
        if (typeof adjustment !== 'number') {
            return NextResponse.json(
                { error: 'Invalid adjustment value' },
                { status: 400 }
            );
        }

        // Adjust budget
        const { error: adjustError } = await supabase
            .rpc('adjust_team_budget', {
                p_team_id: teamId,
                p_adjustment: adjustment,
                p_reason: reason || 'Manual adjustment by admin'
            });

        if (adjustError) {
            return NextResponse.json(
                { error: 'Failed to adjust budget' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Budget adjusted successfully'
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 