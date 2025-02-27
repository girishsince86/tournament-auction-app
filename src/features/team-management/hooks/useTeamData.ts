import { useReducer, useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { TeamData, TeamBudgetDetails, TeamBudgetMetrics } from '../types/team';

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
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .select(`
                    id,
                    name,
                    initial_budget,
                    remaining_budget,
                    max_players,
                    tournament_id
                `)
                .eq('id', teamId)
                .single();

            if (teamError) throw new Error(teamError.message);
            if (!team) throw new Error('Team not found');

            const rawTeam = team as RawTeamData;

            // Fetch available players from the API
            const playersResponse = await fetch(`/api/players?tournamentId=${rawTeam.tournament_id}&status=AVAILABLE`);
            
            if (!playersResponse.ok) {
                console.error('Failed to fetch available players:', playersResponse.statusText);
                throw new Error('Failed to fetch available players');
            }
            
            const playersData = await playersResponse.json();
            const availablePlayers = playersData.players || [];
            
            console.log(`Fetched ${availablePlayers.length} available players for tournament ${rawTeam.tournament_id}`);

            // Fetch preferred players for this team
            const { data: preferredPlayers, error: preferredError } = await supabase
                .from('preferred_players')
                .select(`
                    player_id,
                    max_bid,
                    notes
                `)
                .eq('team_id', teamId);

            if (preferredError) {
                console.error('Error fetching preferred players:', preferredError);
                console.log('Attempting to continue without preferred players data');
            }

            // Mark preferred players
            const preferredPlayerIds = new Set((preferredPlayers || []).map(p => p.player_id));
            console.log(`Found ${preferredPlayerIds.size} preferred player IDs`);
            
            const playersWithPreference = availablePlayers.map((player: any) => {
                const isPreferred = preferredPlayerIds.has(player.id);
                if (isPreferred) {
                    console.log(`Marking player ${player.name} (${player.id}) as preferred`);
                }
                return {
                    ...player,
                    is_preferred: isPreferred,
                    preference: preferredPlayers?.find(p => p.player_id === player.id) || null
                };
            });
            
            console.log(`Marked ${playersWithPreference.filter((p: any) => p.is_preferred).length} players as preferred`);

            const transformedTeam: TeamData = {
                id: rawTeam.id,
                name: rawTeam.name,
                owner_name: 'Unknown Owner',
                tournament_id: rawTeam.tournament_id,
                tournament: {
                    id: rawTeam.tournament_id,
                    name: 'Unknown Tournament'
                },
                budget: {
                    initial_budget: rawTeam.initial_budget,
                    remaining_budget: rawTeam.remaining_budget,
                    allocated_budget: rawTeam.initial_budget - rawTeam.remaining_budget,
                    budget_utilization_percentage: ((rawTeam.initial_budget - rawTeam.remaining_budget) / rawTeam.initial_budget) * 100
                },
                players: [],
                available_players: playersWithPreference,
                max_players: rawTeam.max_players,
                categoryRequirements: []
            };

            const metrics: TeamBudgetMetrics = {
                avg_player_cost: 0,
                total_players: 0,
                total_cost: 0,
                remaining_budget: rawTeam.remaining_budget,
                budget_utilization: ((rawTeam.initial_budget - rawTeam.remaining_budget) / rawTeam.initial_budget) * 100
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