import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/supabase/types/supabase';
import { AuctionRoundWithRelations, PlayerProfile, QueueItemWithPlayer } from '@/types/auction';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface AuctionUpdate {
    currentPlayer: PlayerProfile | null;
    currentRound: AuctionRoundWithRelations | null;
    queue: QueueItemWithPlayer[];
    lastBid: {
        amount: number;
        teamId: string;
        timestamp: string;
    } | null;
}

type AuctionRoundRow = Database['public']['Tables']['auction_rounds']['Row'];
type AuctionRoundChanges = RealtimePostgresChangesPayload<AuctionRoundRow>;

export function useAuctionRealtime(tournamentId: string) {
    const [auctionState, setAuctionState] = useState<AuctionUpdate>({
        currentPlayer: null,
        currentRound: null,
        queue: [],
        lastBid: null
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize Supabase client
        const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Subscribe to auction queue changes
        const queueSubscription = supabase
            .channel('auction_queue_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'auction_queue',
                    filter: `tournament_id=eq.${tournamentId}`
                },
                async () => {
                    try {
                        // Fetch updated queue
                        const { data: queue, error: queueError } = await supabase
                            .from('auction_queue')
                            .select(`
                                *,
                                players (*)
                            `)
                            .eq('tournament_id', tournamentId)
                            .eq('is_processed', false)
                            .order('queue_position', { ascending: true });

                        if (queueError) throw queueError;

                        // Fetch current round if exists
                        const { data: currentRound, error: roundError } = await supabase
                            .from('auction_rounds')
                            .select('*')
                            .eq('tournament_id', tournamentId)
                            .eq('status', 'ACTIVE')
                            .single();

                        if (roundError && roundError.code !== 'PGRST116') throw roundError;

                        // Update state
                        setAuctionState(prev => ({
                            ...prev,
                            queue: queue || [],
                            currentPlayer: queue?.[0]?.players || null,
                            currentRound: currentRound || null
                        }));
                    } catch (error) {
                        console.error('Error handling queue update:', error);
                        setError('Failed to process queue update');
                    }
                }
            )
            .subscribe();

        // Subscribe to auction rounds changes
        const roundsSubscription = supabase
            .channel('auction_rounds_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'auction_rounds',
                    filter: `tournament_id=eq.${tournamentId}`
                },
                async (payload: AuctionRoundChanges) => {
                    if (!payload.new || typeof payload.new !== 'object') return;
                    
                    const newRound = payload.new as AuctionRoundRow;

                    try {
                        if (newRound.status === 'ACTIVE') {
                            // Fetch player details for the current round
                            const { data: player, error: playerError } = await supabase
                                .from('players')
                                .select('*')
                                .eq('id', newRound.player_id)
                                .single();

                            if (playerError) throw playerError;

                            // Update state with new round and player
                            setAuctionState(prev => ({
                                ...prev,
                                currentRound: newRound as AuctionRoundWithRelations,
                                currentPlayer: player
                            }));
                        } else if (newRound.status === 'COMPLETED') {
                            // Clear current round and player
                            setAuctionState(prev => ({
                                ...prev,
                                currentRound: null,
                                currentPlayer: null,
                                lastBid: {
                                    amount: newRound.final_points || 0,
                                    teamId: newRound.winning_team_id || '',
                                    timestamp: newRound.updated_at
                                }
                            }));
                        }
                    } catch (error) {
                        console.error('Error handling round update:', error);
                        setError('Failed to process round update');
                    }
                }
            )
            .subscribe();

        // Cleanup subscriptions
        return () => {
            queueSubscription.unsubscribe();
            roundsSubscription.unsubscribe();
        };
    }, [tournamentId]);

    return {
        auctionState,
        error
    };
} 