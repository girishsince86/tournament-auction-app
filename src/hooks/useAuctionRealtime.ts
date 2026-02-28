import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuctionRealtimeCallbacks, AuctionEvent } from '@/types/auction';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseAuctionRealtimeOptions {
    tournamentId: string;
    callbacks: AuctionRealtimeCallbacks;
    enabled?: boolean;
}

interface UseAuctionRealtimeReturn {
    isConnected: boolean;
    connectionError: string | null;
    lastEvent: AuctionEvent | null;
}

export function useAuctionRealtime({
    tournamentId,
    callbacks,
    enabled = true,
}: UseAuctionRealtimeOptions): UseAuctionRealtimeReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [lastEvent, setLastEvent] = useState<AuctionEvent | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    // Store callbacks in a ref so channel doesn't re-subscribe on every render
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;

    const fireEvent = useCallback((type: AuctionEvent['type'], payload?: Record<string, unknown>) => {
        setLastEvent({ type, timestamp: Date.now(), payload });
    }, []);

    useEffect(() => {
        if (!enabled || !tournamentId) return;

        const channel = supabase
            .channel(`auction-live-${tournamentId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'auction_queue',
                    filter: `tournament_id=eq.${tournamentId}`,
                },
                () => {
                    fireEvent('queue_change');
                    callbacksRef.current.onQueueChange();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'auction_rounds',
                    filter: `tournament_id=eq.${tournamentId}`,
                },
                (payload) => {
                    const record = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
                    fireEvent('round_change', record);
                    callbacksRef.current.onRoundChange(record);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'teams',
                    filter: `tournament_id=eq.${tournamentId}`,
                },
                (payload) => {
                    const record = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
                    const teamId = (record.id as string) ?? '';
                    fireEvent('team_change', { teamId });
                    callbacksRef.current.onTeamChange(teamId);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'players',
                    // players table has no tournament_id — filter client-side
                },
                (payload) => {
                    const record = (payload.new ?? payload.old ?? {}) as Record<string, unknown>;
                    const playerId = (record.id as string) ?? '';
                    fireEvent('player_change', { playerId });
                    callbacksRef.current.onPlayerChange(playerId);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    setConnectionError(null);
                } else if (status === 'CHANNEL_ERROR') {
                    setIsConnected(false);
                    setConnectionError('Failed to connect to realtime updates');
                } else if (status === 'TIMED_OUT') {
                    setIsConnected(false);
                    setConnectionError('Connection timed out');
                    // On reconnect, signal all callbacks for a full re-fetch
                    fireEvent('reconnect');
                    callbacksRef.current.onQueueChange();
                    callbacksRef.current.onRoundChange({});
                    callbacksRef.current.onTeamChange('');
                    callbacksRef.current.onPlayerChange('');
                } else if (status === 'CLOSED') {
                    setIsConnected(false);
                }
            });

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
            channelRef.current = null;
            setIsConnected(false);
        };
    }, [tournamentId, enabled, fireEvent]);

    return { isConnected, connectionError, lastEvent };
}
