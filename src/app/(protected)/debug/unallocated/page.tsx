'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { fetchWithAuth } from '@/lib/utils/api-client';

interface DebugData {
    totalPlayers: number;
    statusCounts: Record<string, number>;
    unallocatedPlayers: Array<{
        id: string;
        name: string;
        status: string;
        category_id: string;
    }>;
    unallocatedCount: number;
    availableApiResponse?: {
        totalPlayers: number;
        unallocatedInResponse: Array<any>;
        unallocatedCount: number;
    };
}

// Add type definitions for API responses
interface AvailablePlayersResponse {
    players: Array<{
        id: string;
        name: string;
        status: string;
    }>;
}

export default function UnallocatedDebugPage() {
    const searchParams = useSearchParams();
    const tournamentId = searchParams.get('tournamentId');
    const [data, setData] = useState<DebugData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!tournamentId) {
            setError('Tournament ID is required. Add ?tournamentId=YOUR_TOURNAMENT_ID to the URL.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Call our debug endpoint
            const response = await fetch(`/api/debug/unallocated-players?tournamentId=${tournamentId}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error fetching debug data:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Also check the available players endpoint
    const checkAvailablePlayers = async () => {
        if (!tournamentId) {
            setError('Tournament ID is required. Add ?tournamentId=YOUR_TOURNAMENT_ID to the URL.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Call the regular available players endpoint
            const result = await fetchWithAuth<AvailablePlayersResponse>(`/api/auction/players/available?tournamentId=${tournamentId}`);
            
            // Check if any UNALLOCATED players are in the response
            const unallocatedPlayers = result.players.filter(p => p.status === 'UNALLOCATED');
            
            setData(prev => ({
                ...prev as DebugData,
                availableApiResponse: {
                    totalPlayers: result.players.length,
                    unallocatedInResponse: unallocatedPlayers,
                    unallocatedCount: unallocatedPlayers.length
                }
            }));
        } catch (err) {
            console.error('Error checking available players:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tournamentId) {
            fetchData();
        }
    }, [tournamentId]);

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                UNALLOCATED Players Debug
            </Typography>
            
            {!tournamentId && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
                    <Typography>
                        Tournament ID is required. Add ?tournamentId=YOUR_TOURNAMENT_ID to the URL.
                    </Typography>
                </Paper>
            )}
            
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={fetchData}
                    disabled={loading || !tournamentId}
                >
                    Check Database
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={checkAvailablePlayers}
                    disabled={loading || !tournamentId}
                >
                    Check API Response
                </Button>
            </Box>
            
            {loading && <CircularProgress sx={{ display: 'block', my: 2 }} />}
            
            {error && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}
            
            {data && (
                <Box>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Database Status</Typography>
                        <Typography>Total Players: {data.totalPlayers}</Typography>
                        <Typography>UNALLOCATED Players: {data.unallocatedCount}</Typography>
                        
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Status Counts:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(data.statusCounts || {}).map(([status, count]) => (
                                <Chip 
                                    key={status} 
                                    label={`${status}: ${count}`} 
                                    color={status === 'UNALLOCATED' ? 'primary' : 'default'}
                                    variant={status === 'UNALLOCATED' ? 'filled' : 'outlined'}
                                />
                            ))}
                        </Box>
                    </Paper>
                    
                    {data.availableApiResponse && (
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>API Response Check</Typography>
                            <Typography>Total Players in API Response: {data.availableApiResponse.totalPlayers}</Typography>
                            <Typography>UNALLOCATED Players in API Response: {data.availableApiResponse.unallocatedCount}</Typography>
                        </Paper>
                    )}
                    
                    {data.unallocatedPlayers && data.unallocatedPlayers.length > 0 && (
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>UNALLOCATED Players List</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Category ID</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.unallocatedPlayers.map((player: any) => (
                                            <TableRow key={player.id}>
                                                <TableCell>{player.id}</TableCell>
                                                <TableCell>{player.name}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={player.status} 
                                                        color="primary" 
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{player.category_id}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                    
                    {data.availableApiResponse && data.availableApiResponse.unallocatedInResponse && (
                        <Paper sx={{ p: 2, mt: 3 }}>
                            <Typography variant="h6" gutterBottom>UNALLOCATED Players in API Response</Typography>
                            {data.availableApiResponse.unallocatedInResponse.length === 0 ? (
                                <Typography color="error">
                                    No UNALLOCATED players found in the API response!
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Category</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.availableApiResponse.unallocatedInResponse.map((player: any) => (
                                                <TableRow key={player.id}>
                                                    <TableCell>{player.id}</TableCell>
                                                    <TableCell>{player.name}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={player.status} 
                                                            color="primary" 
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{player.category_name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    );
} 