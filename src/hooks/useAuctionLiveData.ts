import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useAuctionQueue } from '@/hooks/useAuctionQueue';
import { useAvailablePlayers } from '@/hooks/useAvailablePlayers';
import { useAuctionRealtime } from '@/hooks/useAuctionRealtime';
import { AuctionRealtimeCallbacks, AuctionEvent } from '@/types/auction';
import { AuctionRound } from '@/types/database';
import { supabase } from '@/lib/supabase/client';

interface UseAuctionLiveDataOptions {
    tournamentId: string;
    sportCategory?: string;
    enabled?: boolean;
}

export function useAuctionLiveData({
    tournamentId,
    sportCategory = 'VOLLEYBALL_OPEN_MEN',
    enabled = true,
}: UseAuctionLiveDataOptions) {
    const [lastCompletedRound, setLastCompletedRound] = useState<AuctionRound | null>(null);

    const { teams, isLoading: teamsLoading, fetchTeams } = useTeams({ tournamentId, sportCategory });
    const { queue, isLoading: queueLoading, fetchQueue } = useAuctionQueue({ tournamentId, sportCategory });
    const { players: availablePlayers, isLoading: playersLoading, refetch: refetchPlayers } = useAvailablePlayers({ tournamentId, sportCategory });

    // Debounce timer ref — batches rapid-fire table changes into a single refetch
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const pendingRefetches = useRef<Set<'teams' | 'queue' | 'players'>>(new Set());

    const flushRefetches = useCallback(() => {
        const pending = new Set(pendingRefetches.current);
        pendingRefetches.current.clear();

        if (pending.has('teams')) fetchTeams();
        if (pending.has('queue')) fetchQueue();
        if (pending.has('players')) refetchPlayers();
    }, [fetchTeams, fetchQueue, refetchPlayers]);

    const scheduleRefetch = useCallback((...targets: Array<'teams' | 'queue' | 'players'>) => {
        for (const t of targets) {
            pendingRefetches.current.add(t);
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(flushRefetches, 300);
    }, [flushRefetches]);

    // Fetch last completed round directly from Supabase (no API route needed)
    const fetchLastCompletedRound = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('auction_rounds')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('sport_category', sportCategory)
                .eq('status', 'COMPLETED')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            setLastCompletedRound(data ?? null);
        } catch {
            // Non-critical — don't block on this
        }
    }, [tournamentId, sportCategory]);

    useEffect(() => {
        if (enabled) fetchLastCompletedRound();
    }, [enabled, fetchLastCompletedRound]);

    const callbacks: AuctionRealtimeCallbacks = useMemo(() => ({
        onQueueChange: () => scheduleRefetch('queue'),
        onRoundChange: () => {
            scheduleRefetch('queue', 'teams', 'players');
            fetchLastCompletedRound();
        },
        onTeamChange: () => scheduleRefetch('teams'),
        onPlayerChange: () => scheduleRefetch('players'),
    }), [scheduleRefetch, fetchLastCompletedRound]);

    const { isConnected, connectionError, lastEvent } = useAuctionRealtime({
        tournamentId,
        callbacks,
        enabled,
    });

    const refreshAll = useCallback(() => {
        fetchTeams();
        fetchQueue();
        refetchPlayers();
        fetchLastCompletedRound();
    }, [fetchTeams, fetchQueue, refetchPlayers, fetchLastCompletedRound]);

    return {
        teams,
        queue,
        availablePlayers,
        lastCompletedRound,
        isConnected,
        connectionError,
        lastEvent,
        isLoading: teamsLoading || queueLoading || playersLoading,
        refreshAll,
        // Expose individual fetchers for fine-grained control
        fetchTeams,
        fetchQueue,
        refetchPlayers,
    };
}
