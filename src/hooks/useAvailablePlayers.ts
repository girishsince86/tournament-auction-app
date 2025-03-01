import { useState, useCallback, useEffect } from 'react';
import { PlayerProfile } from '@/types/auction';
import { useRouter } from 'next/navigation';

interface UseAvailablePlayersProps {
    tournamentId: string;
}

export function useAvailablePlayers({ tournamentId }: UseAvailablePlayersProps) {
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
            
            // Handle authentication errors
            if (response.status === 401) {
                console.error('Authentication error: User not authenticated');
                setError('You are not authenticated. Please log in again.');
                // Redirect to login page
                router.push('/login');
                return;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.error || 'Failed to fetch available players');
            }

            console.log('Received players data:', data);
            
            // DEBUG: Log status counts in received data
            if (data.players && data.players.length > 0) {
                const statusCounts = data.players.reduce((acc: Record<string, number>, player: PlayerProfile) => {
                    const status = player.status || 'UNKNOWN';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});
                
                console.log('[useAvailablePlayers] Status counts in API response:', statusCounts);
                
                // Log UNALLOCATED players
                const unallocatedPlayers = data.players.filter((p: PlayerProfile) => p.status === 'UNALLOCATED');
                console.log('[useAvailablePlayers] UNALLOCATED players in API response:', unallocatedPlayers.length);
                
                if (unallocatedPlayers.length > 0) {
                    console.log('[useAvailablePlayers] UNALLOCATED player names:', 
                        unallocatedPlayers.map((p: PlayerProfile) => p.name));
                }
            }
            
            setPlayers(data.players || []);
        } catch (err) {
            console.error('Error in useAvailablePlayers:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch available players');
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId, router]);

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