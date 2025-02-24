import { useState, useCallback, useEffect } from 'react';
import { PlayerProfile } from '@/types/auction';

interface UseAvailablePlayersProps {
    tournamentId: string;
}

export function useAvailablePlayers({ tournamentId }: UseAvailablePlayersProps) {
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPlayers = useCallback(async () => {
        if (!tournamentId) {
            console.error('Tournament ID is required');
            setError('Tournament ID is required');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Fetching available players for tournament:', tournamentId);
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/auction/players/available?tournamentId=${tournamentId}`);
            console.log('Response status:', response.status);
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.error || 'Failed to fetch available players');
            }

            console.log('Received players data:', data);
            setPlayers(data.players || []);
        } catch (err) {
            console.error('Error in useAvailablePlayers:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch available players');
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId]);

    // Automatically fetch players when the hook is mounted or tournamentId changes
    useEffect(() => {
        console.log('useAvailablePlayers effect triggered with tournamentId:', tournamentId);
        fetchPlayers();
    }, [fetchPlayers, tournamentId]);

    return {
        players,
        isLoading,
        error,
        fetchPlayers
    };
} 