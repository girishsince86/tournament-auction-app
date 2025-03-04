'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { fetchWithAuth } from '@/lib/utils/api-client';

interface PlayerData {
    id: string;
    name: string;
    status: string;
    category_id: string;
    category_name: string;
    base_price: number;
    skill_level: string;
    player_position: string;
    profile_image_url: string;
}

export default function TestUnallocatedPage() {
    const searchParams = useSearchParams();
    const tournamentId = searchParams.get('tournamentId') || '11111111-1111-1111-1111-111111111111';
    const [players, setPlayers] = useState<PlayerData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Direct API call with fetchWithAuth
            const result = await fetchWithAuth<{ players: PlayerData[] }>(`/api/auction/players/available?tournamentId=${tournamentId}`);
            
            console.log('API Response:', result);
            
            if (result.players) {
                // Count players by status
                const counts = result.players.reduce((acc, player) => {
                    const status = player.status || 'UNKNOWN';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                setStatusCounts(counts);
                setPlayers(result.players);
                
                // Log UNALLOCATED players
                const unallocatedPlayers = result.players.filter(p => p.status === 'UNALLOCATED');
                console.log('UNALLOCATED players count:', unallocatedPlayers.length);
                
                if (unallocatedPlayers.length > 0) {
                    console.log('UNALLOCATED player names:', unallocatedPlayers.map(p => p.name));
                }
            } else {
                setPlayers([]);
                setStatusCounts({});
            }
        } catch (err) {
            console.error('Error fetching players:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch players');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, [tournamentId]);

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Test UNALLOCATED Players
            </Typography>
            
            <Box sx={{ mb: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={fetchPlayers}
                    disabled={loading}
                >
                    Refresh Players
                </Button>
            </Box>
            
            {loading && <CircularProgress sx={{ display: 'block', my: 2 }} />}
            
            {error && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Player Status Counts</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <Chip 
                            key={status} 
                            label={`${status}: ${count}`} 
                            color={status === 'UNALLOCATED' ? 'primary' : 'default'}
                            variant={status === 'UNALLOCATED' ? 'filled' : 'outlined'}
                        />
                    ))}
                </Box>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>All Players ({players.length})</Typography>
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Skill Level</TableCell>
                                <TableCell>Position</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {players.map((player) => (
                                <TableRow 
                                    key={player.id}
                                    sx={{
                                        bgcolor: player.status === 'UNALLOCATED' ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                                    }}
                                >
                                    <TableCell>{player.name}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={player.status} 
                                            size="small"
                                            color={player.status === 'UNALLOCATED' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{player.category_name}</TableCell>
                                    <TableCell>{player.skill_level}</TableCell>
                                    <TableCell>{player.player_position}</TableCell>
                                </TableRow>
                            ))}
                            {players.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">
                                            No players found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
} 