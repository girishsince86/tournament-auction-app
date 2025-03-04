import { useState, useCallback, useEffect } from 'react';
import { PlayerProfile } from '@/types/auction';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/utils/api-client';

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
            console.log('[useAvailablePlayers] Fetching available players for tournament:', tournamentId);
            setIsLoading(true);
            setError(null);

            const data = await fetchWithAuth<{ players: PlayerProfile[] }>(`/api/auction/players/available?tournamentId=${tournamentId}`);
            
            console.log('[useAvailablePlayers] Received players data:', data);
            
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
            } else {
                console.warn('[useAvailablePlayers] No players returned from API or empty array');
            }
            
            // Ensure we always set an array, even if the API returns null or undefined
            setPlayers(data.players || []);
        } catch (err) {
            console.error('[useAvailablePlayers] Error fetching players:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch players');
            
            // If we get a 401 error, redirect to login
            if (err instanceof Error && err.message.includes('401')) {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId, router]);

    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    return {
        players,
        isLoading,
        error,
        refetch: fetchPlayers
    };
} 