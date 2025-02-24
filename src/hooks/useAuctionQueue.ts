import { useState, useCallback, useEffect } from 'react';
import { QueueItemWithPlayer } from '@/types/auction';

interface UseAuctionQueueProps {
    tournamentId: string;
    enablePolling?: boolean;
}

export function useAuctionQueue({ tournamentId, enablePolling = false }: UseAuctionQueueProps) {
    const [queue, setQueue] = useState<QueueItemWithPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch queue items
    const fetchQueue = useCallback(async () => {
        try {
            console.log('Fetching queue for tournament:', tournamentId);
            setIsLoading(true);
            const response = await fetch(`/api/auction/queue?tournamentId=${tournamentId}`);
            console.log('Queue API response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Queue API error:', errorData);
                throw new Error(errorData.error || 'Failed to fetch queue');
            }
            
            const data = await response.json();
            console.log('Queue data received:', data);
            setQueue(data.queue);
        } catch (err) {
            console.error('Error in fetchQueue:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch queue');
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId]);

    // Initial fetch and setup refresh interval
    useEffect(() => {
        console.log('Setting up queue fetching for tournament:', tournamentId);
        fetchQueue();
        
        // Only set up polling if enabled
        if (enablePolling) {
            console.log('Setting up polling interval');
            const intervalId = setInterval(fetchQueue, 5000);
            
            return () => {
                console.log('Cleaning up queue interval');
                clearInterval(intervalId);
            };
        }
    }, [fetchQueue, tournamentId, enablePolling]);

    // Add player to queue
    const addToQueue = useCallback(async (playerId: string) => {
        try {
            console.log('Adding player to queue:', { playerId, tournamentId });
            const response = await fetch('/api/auction/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    playerId,
                    position: queue.length + 1
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Failed to add player:', data);
                throw new Error(data.error || data.details || 'Failed to add player to queue');
            }

            console.log('Successfully added player:', data);
            await fetchQueue(); // Refresh queue
        } catch (err) {
            console.error('Error in addToQueue:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to add player to queue';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [tournamentId, queue.length, fetchQueue]);

    // Remove player from queue
    const removeFromQueue = useCallback(async (queueItemId: string) => {
        try {
            const response = await fetch(`/api/auction/queue/${queueItemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove player from queue');
            }

            await fetchQueue(); // Refresh queue
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove player from queue');
            throw err;
        }
    }, [fetchQueue]);

    // Update queue positions
    const updateQueuePositions = useCallback(async (queueItemId: string, newPosition: number) => {
        try {
            const response = await fetch(`/api/auction/queue/${queueItemId}/position`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ position: newPosition }),
            });

            if (!response.ok) {
                throw new Error('Failed to update queue position');
            }

            await fetchQueue(); // Refresh queue
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update queue position');
            throw err;
        }
    }, [fetchQueue]);

    // Mark player as processed
    const markAsProcessed = useCallback(async (queueItemId: string) => {
        try {
            const response = await fetch(`/api/auction/queue/${queueItemId}/process`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to mark player as processed');
            }

            await fetchQueue(); // Refresh queue
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark player as processed');
            throw err;
        }
    }, [fetchQueue]);

    return {
        queue,
        isLoading,
        error,
        fetchQueue,
        addToQueue,
        removeFromQueue,
        updateQueuePositions,
        markAsProcessed,
    };
} 