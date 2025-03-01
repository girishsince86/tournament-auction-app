import { useReducer, useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { TeamData } from '../types/team';
import type { TeamBudgetDetails, TeamBudgetMetrics } from '../types/budget';

// Create Supabase client outside component to ensure it's stable
const supabase = createClientComponentClient();

interface UseTeamDataReturn {
    loading: boolean;
    error: string | null;
    teamData: TeamData | null;
    budgetDetails: TeamBudgetDetails | null;
    budgetMetrics: TeamBudgetMetrics | null;
    refreshTeamData: () => Promise<void>;
}

interface TeamDataState {
    loading: boolean;
    error: string | null;
    teamData: TeamData | null;
    budgetDetails: TeamBudgetDetails | null;
    budgetMetrics: TeamBudgetMetrics | null;
}

const initialState: TeamDataState = {
    loading: true,
    error: null,
    teamData: null,
    budgetDetails: null,
    budgetMetrics: null
};

interface RawTeamData {
    id: string;
    name: string;
    initial_budget: number;
    remaining_budget: number;
    max_players: number;
    tournament_id: string;
}

type TeamDataAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: { teamData: TeamData; budgetDetails: TeamBudgetDetails; budgetMetrics: TeamBudgetMetrics } }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'RESET' };

function teamDataReducer(state: TeamDataState, action: TeamDataAction): TeamDataState {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'FETCH_SUCCESS':
            return {
                loading: false,
                error: null,
                teamData: action.payload.teamData,
                budgetDetails: action.payload.budgetDetails,
                budgetMetrics: action.payload.budgetMetrics
            };
        case 'FETCH_ERROR':
            return {
                ...initialState,
                loading: false,
                error: action.payload
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

export function useTeamData(teamId: string): UseTeamDataReturn {
    const [state, dispatch] = useReducer(teamDataReducer, initialState);
    const isMounted = useRef(true);
    const isFetching = useRef(false);

    const fetchTeamData = useCallback(async () => {
        if (!teamId || !isMounted.current || isFetching.current) return;

        isFetching.current = true;
        dispatch({ type: 'FETCH_START' });

        try {
            // Fetch team data from the management API
            const teamManagementResponse = await fetch(`/api/teams/${teamId}/management`);
            
            if (!teamManagementResponse.ok) {
                console.error('Failed to fetch team management data:', teamManagementResponse.statusText);
                throw new Error('Failed to fetch team management data');
            }
            
            const teamManagementData = await teamManagementResponse.json();
            const teamData = teamManagementData.team;
            const availablePlayers = teamManagementData.available_players || [];
            const categoryRequirements = teamManagementData.categoryRequirements || [];
            
            console.log('Team management data:', teamManagementData);
            console.log(`Fetched ${availablePlayers.length} available players for team ${teamId}`);
            console.log(`Fetched ${teamData.players.length} current players for team ${teamId}`);
            console.log('Player counts:', teamData.player_counts);

            // Transform current players to match the expected format
            const formattedCurrentPlayers = teamData.players.map((player: any) => ({
                id: player.id,
                final_points: player.final_bid_points || player.base_price,
                player: {
                    id: player.id,
                    name: player.name,
                    player_position: player.player_position,
                    skill_level: player.skill_level,
                    base_price: player.base_price,
                    profile_image_url: player.profile_image_url || null,
                    status: 'ALLOCATED',
                    category: player.category
                }
            }));

            const transformedTeam: TeamData = {
                id: teamData.id,
                name: teamData.name,
                owner_name: teamData.team_owners?.[0]?.name || 'Unknown Owner',
                tournament_id: teamData.tournament_id,
                tournament: {
                    id: teamData.tournament_id,
                    name: teamData.tournaments?.name || 'Unknown Tournament'
                },
                budget: {
                    initial_budget: teamData.initial_budget,
                    remaining_budget: teamData.remaining_budget,
                    allocated_budget: teamData.initial_budget - teamData.remaining_budget,
                    budget_utilization_percentage: ((teamData.initial_budget - teamData.remaining_budget) / teamData.initial_budget) * 100
                },
                players: formattedCurrentPlayers,
                available_players: availablePlayers,
                max_players: teamData.max_players,
                min_players: teamData.min_players || Math.ceil(teamData.max_players * 0.75),
                categoryRequirements: categoryRequirements,
                player_counts: teamData.player_counts || {
                    total: formattedCurrentPlayers.length,
                    marquee: 0,
                    capped: 0,
                    uncapped: 0
                }
            };

            const metrics: TeamBudgetMetrics = {
                avg_player_cost: formattedCurrentPlayers.length > 0 
                    ? formattedCurrentPlayers.reduce((sum: number, p: { final_points: number }) => sum + p.final_points, 0) / formattedCurrentPlayers.length 
                    : 0,
                total_players: formattedCurrentPlayers.length,
                marquee_players: teamData.player_counts?.marquee || 0,
                capped_players: teamData.player_counts?.capped || 0,
                uncapped_players: teamData.player_counts?.uncapped || 0,
                total_cost: formattedCurrentPlayers.reduce((sum: number, p: { final_points: number }) => sum + p.final_points, 0),
                remaining_budget: teamData.remaining_budget,
                budget_utilization: ((teamData.initial_budget - teamData.remaining_budget) / teamData.initial_budget) * 100
            };

            if (isMounted.current) {
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: {
                        teamData: transformedTeam,
                        budgetDetails: transformedTeam.budget,
                        budgetMetrics: metrics
                    }
                });
            }
        } catch (err) {
            if (isMounted.current) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team data';
                dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
            }
        } finally {
            isFetching.current = false;
        }
    }, [teamId]);

    useEffect(() => {
        isMounted.current = true;

        if (teamId) {
            fetchTeamData();
        } else {
            dispatch({ type: 'RESET' });
        }

        return () => {
            isMounted.current = false;
        };
    }, [teamId]);

    return {
        loading: state.loading,
        error: state.error,
        teamData: state.teamData,
        budgetDetails: state.budgetDetails,
        budgetMetrics: state.budgetMetrics,
        refreshTeamData: fetchTeamData
    };
} 