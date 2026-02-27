import { useState, useCallback, useEffect } from 'react';
import { QueueItemWithPlayer } from '@/types/auction';
import { useRouter } from 'next/navigation';

interface UseAuctionQueueProps {
    tournamentId: string;
    sportCategory?: string;
    enablePolling?: boolean;
}

export function useAuctionQueue({ tournamentId, sportCategory = 'VOLLEYBALL_OPEN_MEN', enablePolling = false }: UseAuctionQueueProps) {
    const [queue, setQueue] = useState<QueueItemWithPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Fetch queue items
    const fetchQueue = useCallback(async () => {
        try {
            console.log('Fetching queue for tournament:', tournamentId);
            setIsLoading(true);
            const response = await fetch(`/api/auction/queue?tournamentId=${tournamentId}&sportCategory=${sportCategory}`);
            console.log('Queue API response status:', response.status);
            
            // Handle authentication errors
            if (response.status === 401) {
                console.error('Authentication error: User not authenticated');
                setError('You are not authenticated. Please log in again.');
                // Redirect to login page
                router.push('/login');
                return;
            }
            
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
    }, [tournamentId, sportCategory, router]);

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
    const addToQueue = useCallback(async (playerId: string, position?: number, refreshQueue: boolean = true) => {
        try {
            console.log('Adding player to queue:', { playerId, tournamentId, refreshAfter: refreshQueue });
            const response = await fetch('/api/auction/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    playerId,
                    sportCategory,
                    // Make position optional - the API will calculate it if not provided
                    ...(position !== undefined ? { position } : {})
                }),
            });

            // Handle non-OK responses
            if (!response.ok) {
                const data = await response.json();
                console.error('Failed to add player:', data);
                
                // Check if it's a constraint error that we can retry
                if (response.status === 500 && data.details && data.details.includes('duplicate key value')) {
                    console.warn('Position conflict detected, the API will handle retries');
                } else {
                    throw new Error(data.error || data.details || 'Failed to add player to queue');
                }
            } else {
                const data = await response.json();
                console.log('Successfully added player:', data);
            }
            
            // Only refresh the queue if refreshQueue is true
            if (refreshQueue) {
                console.log('Refreshing queue after adding player');
                await fetchQueue(); // Refresh queue
            } else {
                console.log('Skipping queue refresh as requested');
            }
            
            return true; // Indicate success
        } catch (err) {
            console.error('Error in addToQueue:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to add player to queue';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [tournamentId, sportCategory, fetchQueue]);

    // Add multiple players to queue using the batch API
    const batchAddToQueueApi = useCallback(async (playerIds: string[]) => {
        try {
            console.log(`Using batch API to add ${playerIds.length} players to queue`);
            
            const response = await fetch('/api/auction/queue/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    playerIds,
                    sportCategory
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('Failed to batch add players:', data);
                throw new Error(data.error || data.details || 'Failed to add players to queue');
            }
            
            const result = await response.json();
            console.log('Batch add result:', result);
            
            // Refresh queue after batch add
            await fetchQueue();
            
            return {
                successful: result.added,
                failed: result.total - result.added - result.skipped,
                skipped: result.skipped,
                total: result.total
            };
        } catch (err) {
            console.error('Error in batchAddToQueueApi:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to add players to queue';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [tournamentId, sportCategory, fetchQueue]);

    // Helper function to process players in chunks
    const processInChunks = async (
        items: string[], 
        chunkSize: number, 
        processor: (item: string) => Promise<any>,
        onProgress?: (current: number, total: number) => void
    ) => {
        const total = items.length;
        let processed = 0;
        let successful = 0;
        let failed = 0;
        let failedItems: string[] = [];
        
        // Process in chunks to avoid overwhelming the server
        for (let i = 0; i < total; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            console.log(`Processing chunk ${i / chunkSize + 1} of ${Math.ceil(total / chunkSize)}, size: ${chunk.length}`);
            
            // Process each item in the chunk sequentially to avoid race conditions
            for (const item of chunk) {
                try {
                    await processor(item);
                    successful++;
                } catch (error) {
                    console.error(`Failed to process item: ${item}`, error);
                    failed++;
                    failedItems.push(item);
                } finally {
                    processed++;
                    if (onProgress) {
                        onProgress(processed, total);
                    }
                }
            }
            
            // Small delay between chunks to allow the server to catch up
            if (i + chunkSize < total) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        return { successful, failed, total, failedItems };
    };

    // Batch add multiple players to queue
    const batchAddToQueue = useCallback(async (playerIds: string[], onProgress?: (current: number, total: number) => void) => {
        console.log(`Starting batch add of ${playerIds.length} players`);
        
        // For large batches (more than 20 players), use the batch API
        if (playerIds.length > 20) {
            try {
                // Set up progress tracking for the batch API
                if (onProgress) {
                    onProgress(0, playerIds.length);
                }
                
                const result = await batchAddToQueueApi(playerIds);
                
                // Update progress to completion
                if (onProgress) {
                    onProgress(playerIds.length, playerIds.length);
                }
                
                return {
                    successful: result.successful,
                    failed: result.failed,
                    skipped: result.skipped,
                    total: playerIds.length,
                    failedItems: [] // We don't have specific failed items from the batch API
                };
            } catch (error) {
                console.error('Batch API failed, falling back to chunked approach:', error);
                // Fall back to the chunked approach if the batch API fails
            }
        }
        
        // Use a smaller chunk size for better reliability
        const CHUNK_SIZE = 5;
        
        // Process players in chunks
        const result = await processInChunks(
            playerIds,
            CHUNK_SIZE,
            (playerId) => addToQueue(playerId, undefined, false),
            onProgress
        );
        
        // Log results
        console.log(`Batch add complete: ${result.successful} succeeded, ${result.failed} failed`);
        
        // If there are failed items and the number is small, try once more
        if (result.failed > 0 && result.failed <= 10) {
            console.log(`Retrying ${result.failedItems.length} failed items...`);
            const retryResult = await processInChunks(
                result.failedItems,
                1, // Process one at a time for retries
                (playerId) => addToQueue(playerId, undefined, false),
                (current, total) => {
                    if (onProgress) {
                        // Adjust progress to account for the main batch
                        onProgress(result.successful + current, result.total);
                    }
                }
            );
            
            // Update the final results
            result.successful += retryResult.successful;
            result.failed = retryResult.failed;
            result.failedItems = retryResult.failedItems;
        }
        
        // Refresh queue once after all operations
        await fetchQueue();
        
        return {
            successful: result.successful,
            failed: result.failed,
            skipped: 0, // For the chunked approach, we don't track skipped items separately
            total: playerIds.length,
            failedItems: result.failedItems
        };
    }, [addToQueue, fetchQueue, batchAddToQueueApi]);

    // Remove player from queue
    const removeFromQueue = useCallback(async (queueItemId: string, onSuccess?: () => Promise<void>) => {
        try {
            console.log('Removing player from queue:', queueItemId);
            const response = await fetch(`/api/auction/queue/${queueItemId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Failed to remove player:', data);
                throw new Error(data.error || data.details || 'Failed to remove player from queue');
            }

            console.log('Successfully removed player:', data);
            await fetchQueue(); // Refresh queue
            
            // Call the onSuccess callback if provided
            if (onSuccess) {
                await onSuccess();
            }
        } catch (err) {
            console.error('Error in removeFromQueue:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove player from queue';
            setError(errorMessage);
            throw new Error(errorMessage);
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
            console.log('Marking queue item as processed:', queueItemId);
            const response = await fetch(`/api/auction/queue/${queueItemId}/process`, {
                method: 'PATCH',
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Failed to mark player as processed:', data);
                throw new Error(data.error || data.details || 'Failed to mark player as processed');
            }

            console.log('Successfully marked player as processed:', data);
            await fetchQueue(); // Refresh queue
        } catch (err) {
            console.error('Error in markAsProcessed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to mark player as processed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [fetchQueue]);

    return {
        queue,
        isLoading,
        error,
        fetchQueue,
        addToQueue,
        batchAddToQueue,
        removeFromQueue,
        updateQueuePositions,
        markAsProcessed,
    };
} 