import { useState, useEffect } from 'react';
import { TeamWithStats } from '@/types/auction';

interface UseTeamsProps {
    tournamentId: string;
}

interface UseTeamsReturn {
    teams: TeamWithStats[];
    isLoading: boolean;
    error: string | null;
}

export function useTeams({ tournamentId }: UseTeamsProps): UseTeamsReturn {
    const [teams, setTeams] = useState<TeamWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTeams() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/teams?tournamentId=${tournamentId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch teams');
                }

                const data = await response.json();
                setTeams(data.teams);
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch teams');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTeams();
    }, [tournamentId]);

    return {
        teams,
        isLoading,
        error
    };
} 