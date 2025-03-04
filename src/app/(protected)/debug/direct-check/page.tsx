'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { fetchWithAuth } from '@/lib/utils/api-client';

interface PlayerSample {
    id: string;
    name: string;
    status: string;
    tournament_id: string;
}

interface UnallocatedPlayer extends PlayerSample {
    category_id: string;
}

interface DirectCheckResponse {
    tournament: {
        id: string;
        name: string;
    } | null;
    player_counts: {
        total: number;
        unallocated: number;
        exact_tournament_match: number;
        status_distribution: Record<string, number>;
    };
    sample_players: PlayerSample[];
    unallocated_players: UnallocatedPlayer[];
}

interface Team {
    id: string;
    name: string;
    owner_name: string;
    remaining_budget: number;
    players_count: number;
    max_players: number;
}

export default function DirectCheckPage() {
    const [tournamentId, setTournamentId] = useState('11111111-1111-1111-1111-111111111111');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DirectCheckResponse | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<UnallocatedPlayer | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchWithAuth<DirectCheckResponse>(
                `/api/debug/direct-player-check?tournamentId=${tournamentId}`
            );
            
            setData(response);
            console.log('Direct check response:', response);
        } catch (err) {
            console.error('Error fetching direct check data:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        setTeamsLoading(true);
        setTeamsError(null);
        
        try {
            const response = await fetchWithAuth<{ teams: Team[] }>(
                `/api/teams?tournamentId=${tournamentId}`
            );
            
            setTeams(response.teams || []);
            console.log('Teams response:', response);
        } catch (err) {
            console.error('Error fetching teams:', err);
            setTeamsError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setTeamsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchTeams();
    }, []);

    const handleOpenDialog = (player: UnallocatedPlayer) => {
        setSelectedPlayer(player);
        setSelectedTeam('');
        setBidAmount(0);
        setAssignError(null);
        setAssignSuccess(null);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedPlayer(null);
    };

    const handleTeamChange = (event: SelectChangeEvent) => {
        setSelectedTeam(event.target.value);
    };

    const handleBidAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBidAmount(Number(event.target.value));
    };

    const handleAssignPlayer = async () => {
        if (!selectedPlayer || !selectedTeam || bidAmount <= 0) {
            setAssignError('Please select a team and enter a valid bid amount');
            return;
        }

        setAssignLoading(true);
        setAssignError(null);
        setAssignSuccess(null);

        try {
            const response = await fetchWithAuth(
                '/api/auction/bid',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tournamentId,
                        playerId: selectedPlayer.id,
                        teamId: selectedTeam,
                        amount: bidAmount,
                    }),
                }
            );

            console.log('Assign player response:', response);
            setAssignSuccess(`Successfully assigned ${selectedPlayer.name} to ${teams.find(t => t.id === selectedTeam)?.name} for ${bidAmount.toLocaleString()} points`);
            
            // Refresh data after successful assignment
            await fetchData();
            await fetchTeams();
            
            // Close dialog after a short delay
            setTimeout(() => {
                handleCloseDialog();
            }, 2000);
        } catch (err) {
            console.error('Error assigning player:', err);
            setAssignError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>
                Direct Database Player Check
            </Typography>
            
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="Tournament ID"
                        value={tournamentId}
                        onChange={(e) => setTournamentId(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                    />
                    <Button 
                        variant="contained" 
                        onClick={fetchData}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Check'}
                    </Button>
                </Box>
                
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>
            
            {data && (
                <Box>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Tournament Info
                        </Typography>
                        {data.tournament ? (
                            <Box>
                                <Typography><strong>ID:</strong> {data.tournament.id}</Typography>
                                <Typography><strong>Name:</strong> {data.tournament.name}</Typography>
                            </Box>
                        ) : (
                            <Alert severity="warning">
                                No tournament found with this ID
                            </Alert>
                        )}
                    </Paper>
                    
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Player Counts
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Box>
                                <Typography variant="h3">{data.player_counts.total}</Typography>
                                <Typography color="text.secondary">Total Players</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h3">{data.player_counts.unallocated}</Typography>
                                <Typography color="text.secondary">Unallocated Players</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h3">{data.player_counts.exact_tournament_match}</Typography>
                                <Typography color="text.secondary">Exact Tournament Match</Typography>
                            </Box>
                        </Box>
                        
                        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                            Status Distribution
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(data.player_counts.status_distribution).map(([status, count]) => (
                                        <TableRow key={status}>
                                            <TableCell>{status}</TableCell>
                                            <TableCell>{count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                    
                    {data.unallocated_players.length > 0 && (
                        <Paper sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Unallocated Players ({data.unallocated_players.length})
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Tournament ID</TableCell>
                                            <TableCell>Category ID</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.unallocated_players.map((player) => (
                                            <TableRow key={player.id}>
                                                <TableCell>{player.id}</TableCell>
                                                <TableCell>{player.name}</TableCell>
                                                <TableCell>{player.status}</TableCell>
                                                <TableCell>{player.tournament_id}</TableCell>
                                                <TableCell>{player.category_id}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleOpenDialog(player)}
                                                    >
                                                        Assign to Team
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                    
                    {data.sample_players.length > 0 && (
                        <Paper sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Sample Players
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Tournament ID</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.sample_players.map((player) => (
                                            <TableRow key={player.id}>
                                                <TableCell>{player.id}</TableCell>
                                                <TableCell>{player.name}</TableCell>
                                                <TableCell>{player.status}</TableCell>
                                                <TableCell>{player.tournament_id}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Assign Player Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Assign Player to Team
                </DialogTitle>
                <DialogContent>
                    {selectedPlayer && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {selectedPlayer.name}
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Player ID: {selectedPlayer.id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Status: {selectedPlayer.status}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Category ID: {selectedPlayer.category_id}
                                </Typography>
                            </Box>
                            
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="team-select-label">Team</InputLabel>
                                <Select
                                    labelId="team-select-label"
                                    value={selectedTeam}
                                    label="Team"
                                    onChange={handleTeamChange}
                                >
                                    {teamsLoading ? (
                                        <MenuItem disabled>Loading teams...</MenuItem>
                                    ) : teams.length === 0 ? (
                                        <MenuItem disabled>No teams available</MenuItem>
                                    ) : (
                                        teams.map((team) => (
                                            <MenuItem key={team.id} value={team.id}>
                                                {team.name} ({team.owner_name}) - {team.remaining_budget.toLocaleString()} points remaining - {team.players_count}/{team.max_players} players
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            
                            <TextField
                                label="Bid Amount"
                                type="number"
                                fullWidth
                                value={bidAmount}
                                onChange={handleBidAmountChange}
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                            />
                            
                            {assignError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {assignError}
                                </Alert>
                            )}
                            
                            {assignSuccess && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {assignSuccess}
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAssignPlayer} 
                        color="primary" 
                        variant="contained"
                        disabled={assignLoading || !selectedTeam || bidAmount <= 0}
                    >
                        {assignLoading ? <CircularProgress size={24} /> : 'Assign Player'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 