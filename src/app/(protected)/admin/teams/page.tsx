'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useRouter } from 'next/navigation';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupIcon from '@mui/icons-material/Group';
import { useTournaments } from '@/hooks/useTournaments';
import { formatPointsInCrores } from '@/lib/utils/format';

interface Team {
    id: string;
    name: string;
    owner_id: string;
    initial_budget: number;
    remaining_budget: number;
    players_count: number;
    owner_name: string;
}

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { tournaments, currentTournament, isLoading: isLoadingTournaments } = useTournaments();
    const [selectedTournament, setSelectedTournament] = useState<string>('');

    useEffect(() => {
        if (currentTournament) {
            setSelectedTournament(currentTournament.id);
        }
    }, [currentTournament]);

    useEffect(() => {
        if (selectedTournament) {
            fetchTeams();
        }
    }, [selectedTournament]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/teams?tournamentId=${selectedTournament}`);
            if (!response.ok) throw new Error('Failed to fetch teams');
            const data = await response.json();
            setTeams(data.teams || []);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleManageTeam = (teamId: string) => {
        router.push(`/teams/${teamId}/management`);
    };

    if (isLoadingTournaments) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (loading && selectedTournament) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box py={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Team Management
                </Typography>

                {/* Tournament Selection */}
                <Box mb={4}>
                    <FormControl fullWidth>
                        <InputLabel id="tournament-select-label">Select Tournament</InputLabel>
                        <Select
                            labelId="tournament-select-label"
                            value={selectedTournament}
                            label="Select Tournament"
                            onChange={(e) => setSelectedTournament(e.target.value)}
                        >
                            {tournaments.map((tournament) => (
                                <MenuItem 
                                    key={tournament.id} 
                                    value={tournament.id}
                                    sx={tournament.id === currentTournament?.id ? { fontWeight: 'bold' } : {}}
                                >
                                    {tournament.name}
                                    {tournament.id === currentTournament?.id && ' (Current)'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {error ? (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                ) : !selectedTournament ? (
                    <Alert severity="info">
                        Please select a tournament to view teams.
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {/* Summary Cards */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Teams
                                    </Typography>
                                    <Typography variant="h3">
                                        {teams.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Players
                                    </Typography>
                                    <Typography variant="h3">
                                        {teams.reduce((sum, team) => sum + team.players_count, 0)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Budget Allocated
                                    </Typography>
                                    <Typography variant="h3">
                                        {formatPointsInCrores(teams.reduce((sum, team) => sum + team.initial_budget, 0))}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Teams Table */}
                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Team Name</TableCell>
                                            <TableCell>Owner</TableCell>
                                            <TableCell align="right">Players</TableCell>
                                            <TableCell align="right">Initial Budget</TableCell>
                                            <TableCell align="right">Remaining Budget</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teams.map((team) => (
                                            <TableRow key={team.id}>
                                                <TableCell>{team.name}</TableCell>
                                                <TableCell>{team.owner_name}</TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        icon={<GroupIcon />}
                                                        label={team.players_count}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        icon={<AccountBalanceIcon />}
                                                        label={formatPointsInCrores(team.initial_budget)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        icon={<AccountBalanceIcon />}
                                                        label={formatPointsInCrores(team.remaining_budget)}
                                                        color={team.remaining_budget < team.initial_budget * 0.2 ? 'error' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Manage Team">
                                                        <IconButton
                                                            onClick={() => handleManageTeam(team.id)}
                                                            size="small"
                                                        >
                                                            <ManageAccountsIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Container>
    );
} 