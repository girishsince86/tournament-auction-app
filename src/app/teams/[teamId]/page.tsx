import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TeamBudget } from '@/components/teams/TeamBudget';
import { TeamPlayers } from '@/components/teams/TeamPlayers';
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
                initialBudget={team.initial_budget}
                remainingBudget={team.remaining_budget}
            />

            <TeamPlayers teamId={team.id} />
        </div>
    );
} 