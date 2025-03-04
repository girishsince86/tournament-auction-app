'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchWithAuth } from '@/lib/utils/api-client';

interface DebugData {
    tournament_id: string;
    categories: {
        count: number;
        ids: string[];
        details: Array<{
            id: string;
            name: string;
        }>;
    };
    queue: {
        count: number;
        player_ids: string[];
    };
    all_players: {
        count: number;
        status_counts: Record<string, number>;
    };
    unallocated: {
        total: number;
        in_categories: number;
        in_queue: number;
        excluded_by_category: {
            count: number;
            players: Array<{
                id: string;
                name: string;
                category_id: string;
            }>;
        };
        excluded_by_queue: {
            count: number;
            players: Array<{
                id: string;
                name: string;
            }>;
        };
        remaining_after_filters: {
            count: number;
            players: Array<{
                id: string;
                name: string;
            }>;
        };
    };
}

export default function CategoryCheckPage() {
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
            const result = await fetchWithAuth<DebugData>(`/api/debug/category-check?tournamentId=${tournamentId}`);
            setData(result);
        } catch (err) {
            console.error('Error fetching debug data:', err);
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
            const result = await fetchWithAuth<any>(`/api/auction/players/available?tournamentId=${tournamentId}`);
            
            // Log the result
            console.log('Available players API response:', result);
            
            // Check if any UNALLOCATED players are in the response
            const unallocatedPlayers = result.players?.filter((p: any) => p.status === 'UNALLOCATED') || [];
            console.log('UNALLOCATED players in API response:', unallocatedPlayers.length);
            
            if (unallocatedPlayers.length > 0) {
                console.log('UNALLOCATED player names:', 
                    unallocatedPlayers.map((p: any) => p.name));
            }
            
            alert(`API returned ${result.players?.length || 0} players, including ${unallocatedPlayers.length} UNALLOCATED players.`);
        } catch (err) {
            console.error('Error checking available players:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            alert(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Category and Player Status Debug
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
                    Check Category Data
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={checkAvailablePlayers}
                    disabled={loading || !tournamentId}
                >
                    Test Available Players API
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
                        <Typography variant="h6" gutterBottom>Tournament Summary</Typography>
                        <Typography>Tournament ID: {data.tournament_id}</Typography>
                        <Typography>Total Players: {data.all_players.count}</Typography>
                        <Typography>Categories: {data.categories.count}</Typography>
                        <Typography>Queue Items: {data.queue.count}</Typography>
                        
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Status Counts:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(data.all_players.status_counts || {}).map(([status, count]) => (
                                <Chip 
                                    key={status} 
                                    label={`${status}: ${count}`} 
                                    color={status === 'UNALLOCATED' ? 'primary' : 'default'}
                                    variant={status === 'UNALLOCATED' ? 'filled' : 'outlined'}
                                />
                            ))}
                        </Box>
                    </Paper>
                    
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">UNALLOCATED Players Analysis</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography>Total UNALLOCATED Players: {data.unallocated.total}</Typography>
                                <Typography>UNALLOCATED Players in Categories: {data.unallocated.in_categories}</Typography>
                                <Typography>UNALLOCATED Players in Queue: {data.unallocated.in_queue}</Typography>
                                <Typography color="error">
                                    UNALLOCATED Players Excluded by Category: {data.unallocated.excluded_by_category.count}
                                </Typography>
                                <Typography color="error">
                                    UNALLOCATED Players Excluded by Queue: {data.unallocated.excluded_by_queue.count}
                                </Typography>
                                <Typography color="primary">
                                    UNALLOCATED Players Remaining After Filters: {data.unallocated.remaining_after_filters.count}
                                </Typography>
                            </Box>
                            
                            {data.unallocated.excluded_by_category.count > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" color="error">
                                        Players Excluded by Category Filter:
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Category ID</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.unallocated.excluded_by_category.players.map(player => (
                                                    <TableRow key={player.id}>
                                                        <TableCell>{player.name}</TableCell>
                                                        <TableCell>{player.category_id}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                            
                            {data.unallocated.excluded_by_queue.count > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" color="error">
                                        Players Excluded by Queue Filter:
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.unallocated.excluded_by_queue.players.map(player => (
                                                    <TableRow key={player.id}>
                                                        <TableCell>{player.name}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                            
                            {data.unallocated.remaining_after_filters.count > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" color="primary">
                                        Players Remaining After Filters:
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.unallocated.remaining_after_filters.players.map(player => (
                                                    <TableRow key={player.id}>
                                                        <TableCell>{player.name}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                    
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Categories</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.categories.details.map(category => (
                                            <TableRow key={category.id}>
                                                <TableCell>{category.id}</TableCell>
                                                <TableCell>{category.name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )}
        </Box>
    );
} 