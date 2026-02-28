'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    LinearProgress,
    Avatar,
    IconButton,
    Tooltip,
    Divider,
} from '@mui/material';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import RefreshIcon from '@mui/icons-material/Refresh';
import GavelIcon from '@mui/icons-material/Gavel';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import QueueIcon from '@mui/icons-material/Queue';
import UndoIcon from '@mui/icons-material/Undo';
import { useAuctionLiveData } from '@/hooks/useAuctionLiveData';
import { useCurrentAuctionRound } from '@/hooks/useCurrentAuctionRound';
import { usePreferredPlayerAlerts, PreferredPlayerAlert } from '@/hooks/usePreferredPlayerAlerts';
import { ConnectionStatus } from '@/components/auction/ConnectionStatus';
import { useAuth } from '@/features/auth/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatPointsInCrores } from '@/lib/utils/format';
import { TeamWithStats, QueueItemWithPlayer } from '@/types/auction';

interface WatchPageProps {
    params: { tournamentId: string };
}

// --- Helper Components ---

function LiveBadge() {
    return (
        <Chip
            label="LIVE"
            size="small"
            sx={{
                bgcolor: 'error.main',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                animation: 'livePulse 2s infinite',
                '@keyframes livePulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
                    '50%': { boxShadow: '0 0 0 6px rgba(239,68,68,0)' },
                },
            }}
        />
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {icon}
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {title}
            </Typography>
        </Box>
    );
}

function StatusChip({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string }> = {
        available: { label: 'Available', color: '#10b981' },
        in_queue: { label: 'In Queue', color: '#f59e0b' },
        allocated: { label: 'Sold', color: '#ef4444' },
        unallocated: { label: 'Unsold', color: '#6b7280' },
    };
    const { label, color } = map[status] ?? map.available;
    return (
        <Chip
            label={label}
            size="small"
            sx={{ bgcolor: color, color: 'white', fontWeight: 600, fontSize: '0.7rem', height: 20 }}
        />
    );
}

// --- Main Page ---

export default function AuctionWatchPage({ params }: WatchPageProps) {
    const { tournamentId } = params;
    const { user } = useAuth();
    const [sportCategory, setSportCategory] = useState('VOLLEYBALL_OPEN_MEN');
    const [myTeamId, setMyTeamId] = useState<string | null>(null);
    const [myTeamName, setMyTeamName] = useState<string | null>(null);

    // Look up team ownership
    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            const { data } = await supabase
                .from('team_owners')
                .select('team_id, teams(name)')
                .eq('auth_user_id', user.id)
                .limit(1)
                .maybeSingle();
            if (data) {
                setMyTeamId(data.team_id);
                setMyTeamName((data as any).teams?.name ?? null);
            }
        })();
    }, [user?.id]);

    const {
        teams,
        queue,
        availablePlayers,
        isConnected,
        connectionError,
        isLoading,
        refreshAll,
    } = useAuctionLiveData({ tournamentId, sportCategory });

    const { lastCompletedRound, recentRounds, refetch: refetchRounds } = useCurrentAuctionRound({ tournamentId, sportCategory });

    // Wire round refetch into realtime — when useAuctionLiveData sees round changes, also refresh rounds
    useEffect(() => {
        // recentRounds is derived from useCurrentAuctionRound and auto-fetches on mount;
        // useAuctionLiveData's onRoundChange already handles teams/queue/players.
        // We hook rounds refetch via a secondary realtime subscription isn't needed
        // because useCurrentAuctionRound can be refetched alongside refreshAll.
    }, []);

    const handleRefresh = useCallback(() => {
        refreshAll();
        refetchRounds();
    }, [refreshAll, refetchRounds]);

    const { alerts, inQueueAlerts } = usePreferredPlayerAlerts({
        teamId: myTeamId,
        queue,
        availablePlayers,
        teams,
    });

    // Find my team data
    const myTeam = teams.find(t => t.id === myTeamId);

    // Current player being auctioned (first in queue)
    const currentQueueItem = queue[0] ?? null;
    const currentPlayer = currentQueueItem?.player ?? null;

    // My team's players (allocated to my team)
    const myPlayers = availablePlayers.filter(p => p.current_team_id === myTeamId && p.status === 'ALLOCATED');

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', p: { xs: 1.5, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <SportsVolleyballIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
                    Auction Watch
                </Typography>
                <LiveBadge />
                <ConnectionStatus isConnected={isConnected} connectionError={connectionError} onRefresh={handleRefresh} />
                <Tabs
                    value={sportCategory}
                    onChange={(_, v) => setSportCategory(v)}
                    sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, px: 2, fontSize: '0.8rem' } }}
                >
                    <Tab value="VOLLEYBALL_OPEN_MEN" icon={<SportsVolleyballIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Volleyball" />
                    <Tab value="THROWBALL_WOMEN" icon={<SportsTennisIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Throwball" />
                </Tabs>
                <Tooltip title="Refresh all">
                    <IconButton onClick={handleRefresh} size="small">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Main Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '2fr 1fr 1fr' }, gap: 2.5 }}>

                {/* Hero Card: Currently Being Auctioned */}
                <Paper
                    sx={{
                        gridColumn: { xs: '1', lg: '1' },
                        p: 3,
                        bgcolor: 'background.paper',
                        border: currentPlayer ? '2px solid' : '1px solid',
                        borderColor: currentPlayer ? 'secondary.main' : 'divider',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {currentPlayer && (
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                            background: 'linear-gradient(90deg, #f97316, #eab308)',
                        }} />
                    )}
                    <SectionHeader icon={<GavelIcon sx={{ color: 'secondary.main' }} />} title="Now Auctioning" />
                    {currentPlayer ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={currentPlayer.profile_image_url ?? undefined}
                                sx={{ width: 72, height: 72, bgcolor: 'grey.800', fontSize: '2rem' }}
                            >
                                {currentPlayer.name?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                                    {currentPlayer.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                    <Chip size="small" label={currentPlayer.player_position?.replace(/_/g, ' ')} sx={{ bgcolor: 'grey.800' }} />
                                    <Chip size="small" label={currentPlayer.skill_level?.replace(/_/g, ' ')} sx={{ bgcolor: 'grey.800' }} />
                                    <Chip size="small" label={`Base: ${formatPointsInCrores(currentPlayer.base_price)}`} sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }} />
                                </Box>
                                {/* Preferred badge */}
                                {alerts.some(a => a.player.id === currentPlayer.id) && (
                                    <Chip icon={<StarIcon />} label="On your preferred list" size="small" sx={{ mt: 1, bgcolor: 'warning.dark', color: 'white' }} />
                                )}
                            </Box>
                        </Box>
                    ) : lastCompletedRound ? (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Last sold:
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {lastCompletedRound.status === 'UNDONE' ? (
                                    <Chip icon={<UndoIcon />} label="REVERSED" size="small" color="warning" />
                                ) : (
                                    <>
                                        Sold for {formatPointsInCrores(lastCompletedRound.final_points)}
                                        {' '} to {teams.find(t => t.id === lastCompletedRound.winning_team_id)?.name ?? 'Unknown'}
                                    </>
                                )}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="h5" color="text.secondary" sx={{ py: 2 }}>
                            Waiting for auction to start...
                        </Typography>
                    )}
                </Paper>

                {/* My Team Summary */}
                {myTeam && (
                    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                        <SectionHeader icon={<PersonIcon sx={{ color: 'primary.main' }} />} title={myTeamName ?? 'My Team'} />
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Budget Remaining</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    {formatPointsInCrores(myTeam.remaining_budget)} / {formatPointsInCrores(myTeam.initial_budget)}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={myTeam.initial_budget ? (myTeam.remaining_budget / myTeam.initial_budget) * 100 : 0}
                                sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.800', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 } }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                Players: {myTeam.current_players} / {myTeam.max_players}
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Roster</Typography>
                        {myPlayers.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No players acquired yet</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 200, overflowY: 'auto' }}>
                                {myPlayers.map(p => (
                                    <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, px: 1, borderRadius: 1, bgcolor: 'grey.900' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.name}</Typography>
                                        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 600 }}>
                                            {formatPointsInCrores(p.base_price)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                )}

                {/* Preferred Players Status */}
                {myTeamId && alerts.length > 0 && (
                    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                        <SectionHeader icon={<StarIcon sx={{ color: 'warning.main' }} />} title="Preferred Players" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 280, overflowY: 'auto' }}>
                            {alerts.map((alert: PreferredPlayerAlert) => (
                                <Box
                                    key={alert.player.id}
                                    sx={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        py: 0.75, px: 1.5, borderRadius: 1,
                                        bgcolor: alert.status === 'in_queue' ? 'rgba(249,115,22,0.1)' : 'grey.900',
                                        border: alert.status === 'in_queue' ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{alert.player.name}</Typography>
                                        {alert.status === 'in_queue' && (
                                            <Typography variant="caption" color="warning.main">Queue #{alert.queuePosition}</Typography>
                                        )}
                                    </Box>
                                    <StatusChip status={alert.status} />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}

                {/* All Teams Overview */}
                <Paper sx={{ p: 3, bgcolor: 'background.paper', gridColumn: { xs: '1', md: '1 / -1', lg: '1 / 3' } }}>
                    <SectionHeader icon={<GroupsIcon sx={{ color: 'primary.main' }} />} title="All Teams" />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {teams.map((team: TeamWithStats) => (
                            <Box
                                key={team.id}
                                sx={{
                                    p: 1.5, borderRadius: 1.5, bgcolor: team.id === myTeamId ? 'rgba(14,165,233,0.08)' : 'grey.900',
                                    border: team.id === myTeamId ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {team.name}
                                        {team.id === myTeamId && <Chip label="You" size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: 'primary.dark' }} />}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.light' }}>
                                        {formatPointsInCrores(team.remaining_budget)}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={team.initial_budget ? (team.remaining_budget / team.initial_budget) * 100 : 0}
                                    sx={{ height: 4, borderRadius: 2, bgcolor: 'grey.800', '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {team.current_players} / {team.max_players} players
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                {/* Queue Preview */}
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                    <SectionHeader icon={<QueueIcon sx={{ color: 'primary.main' }} />} title="Up Next" />
                    {queue.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Queue is empty</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {queue.slice(0, 10).map((item: QueueItemWithPlayer, idx: number) => {
                                const isPreferred = alerts.some(a => a.player.id === item.player_id);
                                return (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            py: 0.75, px: 1.5, borderRadius: 1,
                                            bgcolor: idx === 0 ? 'rgba(249,115,22,0.08)' : 'grey.900',
                                            border: idx === 0 ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 20 }}>
                                            #{idx + 1}
                                        </Typography>
                                        <Typography variant="body2" sx={{ flex: 1, fontWeight: idx === 0 ? 600 : 400 }}>
                                            {item.player.name}
                                        </Typography>
                                        {isPreferred && <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />}
                                        <Typography variant="caption" sx={{ color: 'primary.light' }}>
                                            {formatPointsInCrores(item.player.base_price)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                            {queue.length > 10 && (
                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
                                    +{queue.length - 10} more in queue
                                </Typography>
                            )}
                        </Box>
                    )}
                </Paper>

                {/* Recent Results Feed */}
                <Paper sx={{ p: 3, bgcolor: 'background.paper', gridColumn: { xs: '1', md: '1 / -1' } }}>
                    <SectionHeader icon={<GavelIcon sx={{ color: 'primary.main' }} />} title="Recent Results" />
                    {recentRounds.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No auction results yet</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 300, overflowY: 'auto' }}>
                            {recentRounds.map((round) => {
                                const winningTeam = teams.find(t => t.id === round.winning_team_id);
                                const isUndone = round.status === 'UNDONE';
                                return (
                                    <Box
                                        key={round.id}
                                        sx={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            py: 0.75, px: 1.5, borderRadius: 1, bgcolor: 'grey.900',
                                            opacity: isUndone ? 0.5 : 1,
                                            textDecoration: isUndone ? 'line-through' : 'none',
                                        }}
                                    >
                                        <Typography variant="body2">
                                            Player sold to <strong>{winningTeam?.name ?? 'Unknown'}</strong>
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {isUndone && <Chip icon={<UndoIcon />} label="REVERSED" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                                                {formatPointsInCrores(round.final_points)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}
