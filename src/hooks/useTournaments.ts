import { useState, useEffect } from 'react';
import { Tournament } from '@/lib/supabase/types/supabase';

interface UseTournamentsResult {
    tournaments: Tournament[];
    currentTournament: Tournament | null;
    isLoading: boolean;
    error: string | null;
}

export function useTournaments(): UseTournamentsResult {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTournaments() {
            try {
                const response = await fetch('/api/tournaments');
                if (!response.ok) {
                    throw new Error('Failed to fetch tournaments');
                }
                const data = await response.json();
                setTournaments(data.tournaments);
                setCurrentTournament(data.currentTournament);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTournaments();
    }, []);

    return { tournaments, currentTournament, isLoading, error };
} 