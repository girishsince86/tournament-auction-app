import { useState, useEffect } from 'react';
import type { TeamData, TeamBudgetDetails, TeamBudgetMetrics } from '../types';

interface UseTeamDataReturn {
    loading: boolean;
    error: string | null;
    teamData: TeamData | null;
    budgetDetails: TeamBudgetDetails | undefined;
    budgetMetrics: TeamBudgetMetrics | undefined;
    refreshTeamData: () => Promise<void>;
}

export function useTeamData(teamId: string): UseTeamDataReturn {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teamData, setTeamData] = useState<TeamData | null>(null);
    const [budgetDetails, setBudgetDetails] = useState<TeamBudgetDetails>();
    const [budgetMetrics, setBudgetMetrics] = useState<TeamBudgetMetrics>();

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch team data
            const teamResponse = await fetch(`/api/teams/${teamId}/management`);
            if (!teamResponse.ok) {
                const errorText = await teamResponse.text();
                throw new Error(`Failed to fetch team data: ${errorText}`);
            }

            const teamDataResponse = await teamResponse.json();

            // Fetch budget metrics
            const metricsResponse = await fetch(`/api/teams/${teamId}/budget`);
            if (!metricsResponse.ok) {
                const errorText = await metricsResponse.text();
                throw new Error(`Failed to fetch budget metrics: ${errorText}`);
            }

            const metricsData = await metricsResponse.json();

            // Transform the data
            const budgetDetails: TeamBudgetDetails = {
                initial_budget: teamDataResponse.team.initial_budget,
                remaining_budget: teamDataResponse.team.remaining_budget,
                allocated_budget: teamDataResponse.team.initial_budget - teamDataResponse.team.remaining_budget,
                reserved_budget: teamDataResponse.team.reserved_budget || 0,
                average_player_cost: metricsData.metrics?.avg_player_cost || 0,
                budget_utilization_percentage: ((teamDataResponse.team.initial_budget - teamDataResponse.team.remaining_budget) / teamDataResponse.team.initial_budget) * 100
            };

            setBudgetDetails(budgetDetails);
            setBudgetMetrics(metricsData.metrics);
            setTeamData(teamDataResponse);
        } catch (error) {
            console.error('Error in fetchTeamData:', error);
            setError(error instanceof Error ? error.message : 'Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    return {
        loading,
        error,
        teamData,
        budgetDetails,
        budgetMetrics,
        refreshTeamData: fetchTeamData
    };
} 