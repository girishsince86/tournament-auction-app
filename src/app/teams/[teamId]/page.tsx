import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TeamBudget } from '@/features/team-management/components/dashboard/TeamBudget';
import { CurrentSquadTable } from '@/features/team-management/components/dashboard/CurrentSquadTable';
import { Team } from '@/lib/supabase/schema/teams';
import { Database } from '@/lib/supabase/types/supabase';
import { Typography, Box, Paper } from '@mui/material';

export default async function TeamDetailsPage({ params }: { params: { teamId: string } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    // Fetch team details
    const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.teamId)
        .single();

    if (error) {
        throw new Error(`Error fetching team: ${error.message}`);
    }

    if (!team) {
        throw new Error('Team not found');
    }

    // Fetch team players
    const { data: players, error: playersError } = await supabase
        .from('players')
        .select(`
            *,
            category:player_categories(*),
            final_bid_points:player_bids(points)
        `)
        .eq('team_id', params.teamId);

    if (playersError) {
        throw new Error(`Error fetching players: ${playersError.message}`);
    }

    return (
        <div className="space-y-4">
            <Paper className="p-4">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" component="h1">
                        {team.name}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Created {new Date(team.created_at).toLocaleDateString()}
                    </Typography>
                </Box>
            </Paper>

            <TeamBudget
                teamId={team.id}
                budget={{
                    initial_budget: team.initial_budget,
                    remaining_budget: team.remaining_budget,
                    allocated_budget: team.initial_budget - team.remaining_budget,
                    budget_utilization_percentage: ((team.initial_budget - team.remaining_budget) / team.initial_budget) * 100
                }}
                metrics={{
                    avg_player_cost: players?.length ? (team.initial_budget - team.remaining_budget) / players.length : 0,
                    total_players: players?.length || 0,
                    total_cost: team.initial_budget - team.remaining_budget,
                    remaining_budget: team.remaining_budget,
                    budget_utilization: ((team.initial_budget - team.remaining_budget) / team.initial_budget) * 100
                }}
            />

            <CurrentSquadTable players={players || []} />
        </div>
    );
} 