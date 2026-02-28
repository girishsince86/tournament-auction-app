import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuctionRound } from '@/types/database';

interface UseCurrentAuctionRoundOptions {
    tournamentId: string;
    sportCategory?: string;
}

export function useCurrentAuctionRound({ tournamentId, sportCategory = 'VOLLEYBALL_OPEN_MEN' }: UseCurrentAuctionRoundOptions) {
    const [lastCompletedRound, setLastCompletedRound] = useState<AuctionRound | null>(null);
    const [recentRounds, setRecentRounds] = useState<AuctionRound[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRounds = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('auction_rounds')
                .select('*')
                .eq('tournament_id', tournamentId)
                .eq('sport_category', sportCategory)
                .in('status', ['COMPLETED', 'UNDONE'])
                .order('updated_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            setRecentRounds(data ?? []);
            setLastCompletedRound(data?.find(r => r.status === 'COMPLETED') ?? null);
        } catch (err) {
            console.error('Error fetching auction rounds:', err);
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId, sportCategory]);

    useEffect(() => {
        fetchRounds();
    }, [fetchRounds]);

    return {
        lastCompletedRound,
        recentRounds,
        isLoading,
        refetch: fetchRounds,
    };
}
