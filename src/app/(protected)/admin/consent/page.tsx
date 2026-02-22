'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
    TextField,
    InputAdornment,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
} from '@mui/material';
import {
    Gavel as AuctionIcon,
    Casino as SpinIcon,
    CheckCircle as CheckIcon,
    HourglassEmpty as PendingIcon,
    Search as SearchIcon,
    People as PeopleIcon,
} from '@mui/icons-material';

interface PlayerConsent {
    id: string;
    name: string;
    phone_number: string;
    email: string | null;
    consent_status: 'RESPONDED' | 'PENDING';
    consent_choice: 'AUCTION_POOL' | 'SPIN_THE_WHEEL' | null;
    consent_submitted_at: string | null;
}

interface Summary {
    total: number;
    responded: number;
    pending: number;
    auctionPool: number;
    spinTheWheel: number;
}

type FilterStatus = 'ALL' | 'RESPONDED' | 'PENDING';

export default function AdminConsentPage() {
    const theme = useTheme();
    const [players, setPlayers] = useState<PlayerConsent[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/consent');
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch');
                setPlayers(data.players);
                setSummary(data.summary);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load consent data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            // Filter by status
            if (filterStatus === 'RESPONDED' && p.consent_status !== 'RESPONDED') return false;
            if (filterStatus === 'PENDING' && p.consent_status !== 'PENDING') return false;

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    p.name.toLowerCase().includes(q) ||
                    p.phone_number.includes(q) ||
                    (p.email && p.email.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [players, filterStatus, searchQuery]);

    const cardSx = (color: string) => ({
        p: 2.5,
        borderRadius: 2,
        flex: 1,
        minWidth: 120,
        background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.25)}`,
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
            >
                Auction Consent Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.6), mb: 3 }}>
                TB Open Women — Player consent status for auction participation
            </Typography>

            {/* Summary Cards */}
            {summary && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <Paper elevation={0} sx={cardSx('#8b5cf6')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PeopleIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Total Players
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#8b5cf6' }}>
                            {summary.total}
                        </Typography>
                    </Paper>

                    <Paper elevation={0} sx={cardSx('#22c55e')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CheckIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Responded
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e' }}>
                            {summary.responded}
                        </Typography>
                    </Paper>

                    <Paper elevation={0} sx={cardSx('#f59e0b')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PendingIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Pending
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                            {summary.pending}
                        </Typography>
                    </Paper>

                    <Paper elevation={0} sx={cardSx('#0ea5e9')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AuctionIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Auction Pool
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0ea5e9' }}>
                            {summary.auctionPool}
                        </Typography>
                    </Paper>

                    <Paper elevation={0} sx={cardSx('#f97316')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <SpinIcon sx={{ color: '#f97316', fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6), fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Spin the Wheel
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f97316' }}>
                            {summary.spinTheWheel}
                        </Typography>
                    </Paper>
                </Stack>
            )}

            {/* Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { sm: 'center' },
                }}
            >
                <TextField
                    size="small"
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, opacity: 0.5 }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <ToggleButtonGroup
                    value={filterStatus}
                    exclusive
                    onChange={(_, val) => { if (val) setFilterStatus(val); }}
                    size="small"
                >
                    <ToggleButton value="ALL">All ({summary?.total || 0})</ToggleButton>
                    <ToggleButton value="RESPONDED">Responded ({summary?.responded || 0})</ToggleButton>
                    <ToggleButton value="PENDING">Pending ({summary?.pending || 0})</ToggleButton>
                </ToggleButtonGroup>
            </Paper>

            {/* Player Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Player Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Choice</TableCell>
                            <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Submitted</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPlayers.map((player, index) => (
                            <TableRow
                                key={player.id}
                                sx={{
                                    '&:nth-of-type(odd)': {
                                        bgcolor: alpha(theme.palette.action.hover, 0.03),
                                    },
                                }}
                            >
                                <TableCell sx={{ color: alpha(theme.palette.text.primary, 0.5) }}>
                                    {index + 1}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    {player.name}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {player.phone_number}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontSize: '0.85rem' }}>
                                    {player.email || '—'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        icon={player.consent_status === 'RESPONDED' ? <CheckIcon /> : <PendingIcon />}
                                        label={player.consent_status === 'RESPONDED' ? 'Done' : 'Pending'}
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            bgcolor: player.consent_status === 'RESPONDED'
                                                ? alpha('#22c55e', 0.15)
                                                : alpha('#f59e0b', 0.15),
                                            color: player.consent_status === 'RESPONDED' ? '#22c55e' : '#f59e0b',
                                            '& .MuiChip-icon': { color: 'inherit' },
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {player.consent_choice ? (
                                        <Chip
                                            size="small"
                                            icon={player.consent_choice === 'AUCTION_POOL' ? <AuctionIcon /> : <SpinIcon />}
                                            label={player.consent_choice === 'AUCTION_POOL' ? 'Auction' : 'Spin'}
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                bgcolor: player.consent_choice === 'AUCTION_POOL'
                                                    ? alpha('#0ea5e9', 0.15)
                                                    : alpha('#f97316', 0.15),
                                                color: player.consent_choice === 'AUCTION_POOL' ? '#0ea5e9' : '#f97316',
                                                '& .MuiChip-icon': { color: 'inherit' },
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.3) }}>
                                            —
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    {player.consent_submitted_at ? (
                                        <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6) }}>
                                            {new Date(player.consent_submitted_at).toLocaleString('en-IN', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                                timeZone: 'Asia/Kolkata',
                                            })}
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.3) }}>
                                            —
                                        </Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPlayers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: alpha(theme.palette.text.primary, 0.4) }}>
                                    No players match your filter
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Footer count */}
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: alpha(theme.palette.text.primary, 0.4), textAlign: 'right' }}>
                Showing {filteredPlayers.length} of {players.length} players
            </Typography>
        </Box>
    );
}
