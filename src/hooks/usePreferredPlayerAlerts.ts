import { useState, useCallback, useEffect, useMemo } from 'react';
import { QueueItemWithPlayer, PlayerProfile, TeamWithStats } from '@/types/auction';

interface PreferredPlayer {
    id: string;
    name: string;
    position: string;
    skill_level: string;
    base_price: number;
    priority: number;
    status: string;
    max_bid: number;
}

export type PreferredPlayerStatus = 'available' | 'in_queue' | 'allocated' | 'unallocated';

export interface PreferredPlayerAlert {
    player: PreferredPlayer;
    status: PreferredPlayerStatus;
    queuePosition?: number;
    allocatedToTeam?: string;
}

interface UsePreferredPlayerAlertsOptions {
    teamId: string | null;
    queue: QueueItemWithPlayer[];
    availablePlayers: PlayerProfile[];
    teams: TeamWithStats[];
}

export function usePreferredPlayerAlerts({
    teamId,
    queue,
    availablePlayers,
    teams,
}: UsePreferredPlayerAlertsOptions) {
    const [preferredPlayers, setPreferredPlayers] = useState<PreferredPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPreferredPlayers = useCallback(async () => {
        if (!teamId) return;
        try {
            setIsLoading(true);
            const response = await fetch(`/api/teams/${teamId}/preferred-players`);
            if (!response.ok) return;
            const data = await response.json();
            setPreferredPlayers(data.players ?? []);
        } catch {
            // Non-critical
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchPreferredPlayers();
    }, [fetchPreferredPlayers]);

    // Derive alert statuses from live data
    const alerts: PreferredPlayerAlert[] = useMemo(() => {
        return preferredPlayers.map((pp) => {
            // Check if in queue
            const queueItem = queue.find(q => q.player_id === pp.id);
            if (queueItem) {
                return { player: pp, status: 'in_queue' as const, queuePosition: queueItem.queue_position };
            }

            // Check if allocated (status from the player record)
            if (pp.status === 'ALLOCATED') {
                // Find which team has this player
                // We'd need players with current_team_id; for now use the status
                return { player: pp, status: 'allocated' as const };
            }

            if (pp.status === 'UNALLOCATED') {
                return { player: pp, status: 'unallocated' as const };
            }

            // Otherwise available
            return { player: pp, status: 'available' as const };
        });
    }, [preferredPlayers, queue]);

    // Players from preferred list that are currently in the queue
    const inQueueAlerts = alerts.filter(a => a.status === 'in_queue');

    return {
        alerts,
        inQueueAlerts,
        preferredPlayers,
        isLoading,
        refetch: fetchPreferredPlayers,
    };
}
