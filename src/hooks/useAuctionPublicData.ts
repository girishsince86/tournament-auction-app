import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuctionRealtime } from '@/hooks/useAuctionRealtime';
import { TeamWithStats, QueueItemWithPlayer, PlayerProfile, AuctionRealtimeCallbacks, AuctionEvent } from '@/types/auction';

/**
 * Public-friendly data hook that fetches directly from Supabase using the anon key.
 * Does NOT use authenticated API routes — safe for unauthenticated pages.
 */
interface UseAuctionPublicDataOptions {
    tournamentId: string;
    sportCategory?: string;
    enabled?: boolean;
}

export function useAuctionPublicData({
    tournamentId,
    sportCategory = 'VOLLEYBALL_OPEN_MEN',
    enabled = true,
}: UseAuctionPublicDataOptions) {
    const [teams, setTeams] = useState<TeamWithStats[]>([]);
    const [queue, setQueue] = useState<QueueItemWithPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTeams = useCallback(async () => {
        const { data } = await supabase
            .from('teams')
            .select('*')
            .eq('tournament_id', tournamentId)
            .eq('sport_category', sportCategory)
            .order('name');

        if (data) {
            setTeams(data.map(t => ({
                ...t,
                total_points: t.initial_budget - t.remaining_budget,
                current_players: 0, // Will be enriched below
            })));
        }
    }, [tournamentId, sportCategory]);

    const fetchQueue = useCallback(async () => {
        const { data } = await supabase
            .from('auction_queue')
            .select('*, player:players(*)')
            .eq('tournament_id', tournamentId)
            .eq('is_processed', false)
            .eq('sport_category', sportCategory)
            .order('queue_position', { ascending: true });

        if (data) {
            setQueue(data as unknown as QueueItemWithPlayer[]);
        }
    }, [tournamentId, sportCategory]);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([fetchTeams(), fetchQueue()]);
        setIsLoading(false);
    }, [fetchTeams, fetchQueue]);

    useEffect(() => {
        if (enabled) fetchAll();
    }, [enabled, fetchAll]);

    // Debounce for realtime
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRefetches = useRef<Set<'teams' | 'queue'>>(new Set());

    const flushRefetches = useCallback(() => {
        const pending = new Set(pendingRefetches.current);
        pendingRefetches.current.clear();
        if (pending.has('teams')) fetchTeams();
        if (pending.has('queue')) fetchQueue();
    }, [fetchTeams, fetchQueue]);

    const scheduleRefetch = useCallback((...targets: Array<'teams' | 'queue'>) => {
        for (const t of targets) pendingRefetches.current.add(t);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(flushRefetches, 300);
    }, [flushRefetches]);

    const callbacks: AuctionRealtimeCallbacks = useMemo(() => ({
        onQueueChange: () => scheduleRefetch('queue'),
        onRoundChange: () => scheduleRefetch('queue', 'teams'),
        onTeamChange: () => scheduleRefetch('teams'),
        onPlayerChange: () => {}, // Not needed for public view
    }), [scheduleRefetch]);

    const { isConnected, connectionError, lastEvent } = useAuctionRealtime({
        tournamentId,
        callbacks,
        enabled,
    });

    return {
        teams,
        queue,
        isConnected,
        connectionError,
        lastEvent,
        isLoading,
        refreshAll: fetchAll,
    };
}
