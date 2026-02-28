'use client';

import { useState, useCallback } from 'react';
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
} from '@mui/material';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import RefreshIcon from '@mui/icons-material/Refresh';
import GavelIcon from '@mui/icons-material/Gavel';
import GroupsIcon from '@mui/icons-material/Groups';
import QueueIcon from '@mui/icons-material/Queue';
import UndoIcon from '@mui/icons-material/Undo';
import { useAuctionPublicData } from '@/hooks/useAuctionPublicData';
import { useCurrentAuctionRound } from '@/hooks/useCurrentAuctionRound';
import { ConnectionStatus } from '@/components/auction/ConnectionStatus';
import { formatPointsInCrores } from '@/lib/utils/format';
import { TeamWithStats, QueueItemWithPlayer } from '@/types/auction';

interface LivePageProps {
    params: { tournamentId: string };
}

function LiveBadge() {
    return (
        <Chip
            label="LIVE"
            size="small"
            sx={{
                bgcolor: 'error.main',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 24,
                animation: 'livePulse 2s infinite',
                '@keyframes livePulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
                    '50%': { boxShadow: '0 0 0 8px rgba(239,68,68,0)' },
                },
            }}
        />
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {icon}
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {title}
            </Typography>
        </Box>
    );
}

export default function AuctionLivePage({ params }: LivePageProps) {
    const { tournamentId } = params;
    const [sportCategory, setSportCategory] = useState('VOLLEYBALL_OPEN_MEN');

    const {
        teams,
        queue,
        isConnected,
        connectionError,
        isLoading,
        refreshAll,
    } = useAuctionPublicData({ tournamentId, sportCategory });

    const { lastCompletedRound, recentRounds, refetch: refetchRounds } = useCurrentAuctionRound({ tournamentId, sportCategory });

    const handleRefresh = useCallback(() => {
        refreshAll();
        refetchRounds();
    }, [refreshAll, refetchRounds]);

    const currentQueueItem = queue[0] ?? null;
    const currentPlayer = currentQueueItem?.player ?? null;

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: 'background.default' }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: { xs: 2, md: 4 },
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <SportsVolleyballIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h3" sx={{ flex: 1 }}>
                    Auction Live
                </Typography>
                <LiveBadge />
                <ConnectionStatus isConnected={isConnected} connectionError={connectionError} onRefresh={handleRefresh} />
                <Tabs
                    value={sportCategory}
                    onChange={(_, v) => setSportCategory(v)}
                    sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5, px: 2, fontSize: '0.9rem' } }}
                >
                    <Tab value="VOLLEYBALL_OPEN_MEN" icon={<SportsVolleyballIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Volleyball" />
                    <Tab value="THROWBALL_WOMEN" icon={<SportsTennisIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Throwball" />
                </Tabs>
                <Tooltip title="Refresh">
                    <IconButton onClick={handleRefresh}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Hero: Currently Auctioning */}
            <Paper
                sx={{
                    p: { xs: 3, md: 4 },
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    border: currentPlayer ? '2px solid' : '1px solid',
                    borderColor: currentPlayer ? 'secondary.main' : 'divider',
                }}
            >
                {currentPlayer && (
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                        background: 'linear-gradient(90deg, #f97316, #eab308, #f97316)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s linear infinite',
                        '@keyframes shimmer': {
                            '0%': { backgroundPosition: '200% 0' },
                            '100%': { backgroundPosition: '-200% 0' },
                        },
                    }} />
                )}
                <SectionHeader icon={<GavelIcon sx={{ color: 'secondary.main', fontSize: 28 }} />} title="Now Auctioning" />
                {currentPlayer ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            src={currentPlayer.profile_image_url ?? undefined}
                            sx={{ width: 96, height: 96, bgcolor: 'grey.800', fontSize: '2.5rem' }}
                        >
                            {currentPlayer.name?.[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="h2" sx={{ lineHeight: 1.1 }}>
                                {currentPlayer.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                                <Chip label={currentPlayer.player_position?.replace(/_/g, ' ')} sx={{ bgcolor: 'grey.800', fontSize: '0.85rem' }} />
                                <Chip label={currentPlayer.skill_level?.replace(/_/g, ' ')} sx={{ bgcolor: 'grey.800', fontSize: '0.85rem' }} />
                                <Chip
                                    label={`Base: ${formatPointsInCrores(currentPlayer.base_price)}`}
                                    sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}
                                />
                            </Box>
                        </Box>
                    </Box>
                ) : lastCompletedRound ? (
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>Last sold:</Typography>
                        <Typography variant="h4">
                            {lastCompletedRound.status === 'UNDONE' ? (
                                <Chip icon={<UndoIcon />} label="REVERSED" color="warning" />
                            ) : (
                                <>
                                    Sold for <strong>{formatPointsInCrores(lastCompletedRound.final_points)}</strong>
                                    {' '}to {teams.find(t => t.id === lastCompletedRound.winning_team_id)?.name ?? 'Unknown'}
                                </>
                            )}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="h4" color="text.secondary" sx={{ py: 3 }}>
                        Waiting for auction to start...
                    </Typography>
                )}
            </Paper>

            {/* Two-column: Teams + Queue/Results */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 3 }}>

                {/* All Teams Overview */}
                <Paper sx={{ p: 3 }}>
                    <SectionHeader icon={<GroupsIcon sx={{ color: 'primary.main' }} />} title="Teams" />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {teams.map((team: TeamWithStats) => (
                            <Box key={team.id} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'grey.900' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{team.name}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                                        {formatPointsInCrores(team.remaining_budget)}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={team.initial_budget ? (team.remaining_budget / team.initial_budget) * 100 : 0}
                                    sx={{ height: 5, borderRadius: 2, bgcolor: 'grey.800', '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {team.current_players} / {team.max_players} players
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                {/* Queue + Results stacked */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Queue Preview */}
                    <Paper sx={{ p: 3 }}>
                        <SectionHeader icon={<QueueIcon sx={{ color: 'primary.main' }} />} title="Up Next" />
                        {queue.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Queue is empty</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {queue.slice(0, 10).map((item: QueueItemWithPlayer, idx: number) => (
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
                                        <Typography variant="caption" sx={{ color: 'primary.light' }}>
                                            {formatPointsInCrores(item.player.base_price)}
                                        </Typography>
                                    </Box>
                                ))}
                                {queue.length > 10 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
                                        +{queue.length - 10} more
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>

                    {/* Recent Results */}
                    <Paper sx={{ p: 3 }}>
                        <SectionHeader icon={<GavelIcon sx={{ color: 'primary.main' }} />} title="Recent Results" />
                        {recentRounds.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No results yet</Typography>
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
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ textDecoration: isUndone ? 'line-through' : 'none' }}>
                                                Sold to <strong>{winningTeam?.name ?? 'Unknown'}</strong>
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
        </Box>
    );
}
