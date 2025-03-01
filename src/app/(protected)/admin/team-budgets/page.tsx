'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Tooltip,
    Tabs,
    Tab,
    TextField,
    IconButton,
    Divider,
    ButtonGroup,
    Button
} from '@mui/material';
import { useTournaments } from '@/hooks/useTournaments';
import { TeamBudget } from '@/components/teams/TeamBudget';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatPointsInCrores } from '@/lib/utils/format';

interface Team {
    id: string;
    name: string;
    initial_budget: number;
    remaining_budget: number;
    total_spent: number;
    players_count: number;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`team-budget-tabpanel-${index}`}
            aria-labelledby={`team-budget-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `team-budget-tab-${index}`,
        'aria-controls': `team-budget-tabpanel-${index}`,
    };
}

export default function TeamBudgetsPage() {
    const { tournaments, currentTournament, isLoading: isLoadingTournaments, error: tournamentsError } = useTournaments();
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'budget' | 'utilization'>('name');

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

    useEffect(() => {
        let result = [...teams];
        
        // Apply search
        if (searchQuery) {
            result = result.filter(team => 
                team.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'budget':
                    return b.remaining_budget - a.remaining_budget;
                case 'utilization':
                    const utilizationA = ((a.initial_budget - a.remaining_budget) / a.initial_budget) * 100;
                    const utilizationB = ((b.initial_budget - b.remaining_budget) / b.initial_budget) * 100;
                    return utilizationB - utilizationA;
                default:
                    return 0;
            }
        });

        setFilteredTeams(result);
    }, [teams, searchQuery, sortBy]);

    const fetchTeams = async () => {
        try {
            setIsLoadingTeams(true);
            setTeamsError(null);
            const response = await fetch(`/api/teams?tournamentId=${selectedTournament}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch teams');
            }

            const data = await response.json();
            setTeams(data.teams || []);
            setSelectedTeamIndex(0);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setTeamsError(error instanceof Error ? error.message : 'Failed to fetch teams');
        } finally {
            setIsLoadingTeams(false);
        }
    };

    const handleBudgetUpdate = () => {
        fetchTeams();
    };

    const handleTeamChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTeamIndex(newValue);
    };

    if (isLoadingTournaments) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (tournamentsError) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {tournamentsError}
            </Alert>
        );
    }

    const getTotalStats = () => {
        const total = teams.reduce((acc, team) => ({
            initial: acc.initial + team.initial_budget,
            spent: acc.spent + (team.initial_budget - team.remaining_budget),
            remaining: acc.remaining + team.remaining_budget,
            players: teams.length * 9 // Calculate total based on 9 players per team
        }), { initial: 0, spent: 0, remaining: 0, players: 0 });

        return total;
    };

    return (
        <div className="p-4">
            {/* Header Section */}
            <Box mb={4}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Team Budget Management
                            {currentTournament && selectedTournament === currentTournament.id && (
                                <Typography component="span" color="primary" sx={{ ml: 1 }}>
                                    (Current Tournament)
                                </Typography>
                            )}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                </Grid>
            </Box>

            {!selectedTournament ? (
                <Alert severity="info">
                    Please select a tournament to view team budgets.
                </Alert>
            ) : isLoadingTeams ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : teamsError ? (
                <Alert severity="error">
                    {teamsError}
                </Alert>
            ) : teams.length === 0 ? (
                <Alert severity="info">
                    No teams found for this tournament.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {/* Tournament Stats Cards */}
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            {/* Total Budget Stats */}
                            {(() => {
                                const totals = getTotalStats();
                                return (
                                    <>
                                        <Grid item xs={12} md={3}>
                                            <Card>
                                                <CardContent>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Total Budget Allocated
                                                    </Typography>
                                                    <Typography variant="h4">
                                                        {formatPointsInCrores(totals.initial)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Card>
                                                <CardContent>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Total Spent
                                                    </Typography>
                                                    <Typography variant="h4" color="error">
                                                        {formatPointsInCrores(totals.spent)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Card>
                                                <CardContent>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Total Remaining
                                                    </Typography>
                                                    <Typography variant="h4" color="success.main">
                                                        {formatPointsInCrores(totals.remaining)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Card>
                                                <CardContent>
                                                    <Typography color="textSecondary" gutterBottom>
                                                        Total Players
                                                    </Typography>
                                                    <Typography variant="h4">
                                                        {totals.players}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </>
                                );
                            })()}
                        </Grid>
                    </Grid>

                    {/* Search and Filters */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search teams..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <ButtonGroup fullWidth>
                                        <Button
                                            variant={sortBy === 'name' ? 'contained' : 'outlined'}
                                            onClick={() => setSortBy('name')}
                                            startIcon={<SortIcon />}
                                        >
                                            Name
                                        </Button>
                                        <Button
                                            variant={sortBy === 'budget' ? 'contained' : 'outlined'}
                                            onClick={() => setSortBy('budget')}
                                            startIcon={<TrendingUpIcon />}
                                        >
                                            Budget
                                        </Button>
                                        <Button
                                            variant={sortBy === 'utilization' ? 'contained' : 'outlined'}
                                            onClick={() => setSortBy('utilization')}
                                            startIcon={<TrendingDownIcon />}
                                        >
                                            Utilization
                                        </Button>
                                    </ButtonGroup>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Teams Overview */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Teams Overview
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Team</TableCell>
                                                <TableCell align="right">Initial Budget</TableCell>
                                                <TableCell align="right">Spent</TableCell>
                                                <TableCell align="right">Remaining</TableCell>
                                                <TableCell align="right">Players</TableCell>
                                                <TableCell>Budget Usage</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredTeams.map((team) => {
                                                const percentageUsed = ((team.initial_budget - team.remaining_budget) / team.initial_budget) * 100;
                                                const usageColor = percentageUsed >= 90 ? 'error' : percentageUsed >= 75 ? 'warning' : 'primary';
                                                
                                                return (
                                                    <TableRow 
                                                        key={team.id}
                                                        hover
                                                        onClick={() => {
                                                            const index = teams.findIndex(t => t.id === team.id);
                                                            setSelectedTeamIndex(index);
                                                        }}
                                                        sx={{ cursor: 'pointer' }}
                                                    >
                                                        <TableCell>{team.name}</TableCell>
                                                        <TableCell align="right">{formatPointsInCrores(team.initial_budget)}</TableCell>
                                                        <TableCell align="right">{formatPointsInCrores(team.total_spent)}</TableCell>
                                                        <TableCell align="right">{formatPointsInCrores(team.remaining_budget)}</TableCell>
                                                        <TableCell align="right">{team.players_count}</TableCell>
                                                        <TableCell>
                                                            <Tooltip title={`${percentageUsed.toFixed(1)}% used`}>
                                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={percentageUsed}
                                                                        color={usageColor}
                                                                        sx={{ height: 10, borderRadius: 5 }}
                                                                    />
                                                                </Box>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Team Details */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs 
                                        value={selectedTeamIndex} 
                                        onChange={handleTeamChange}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        aria-label="team budget tabs"
                                    >
                                        {teams.map((team, index) => (
                                            <Tab 
                                                key={team.id}
                                                label={team.name}
                                                {...a11yProps(index)}
                                            />
                                        ))}
                                    </Tabs>
                                </Box>
                                {teams.map((team, index) => (
                                    <TabPanel key={team.id} value={selectedTeamIndex} index={index}>
                                        <Box>
                                            <Typography variant="h5" gutterBottom color="primary">
                                                {team.name} - Budget Details
                                            </Typography>
                                            <TeamBudget
                                                teamId={team.id}
                                                budget={{
                                                    initial_budget: team.initial_budget,
                                                    remaining_budget: team.remaining_budget,
                                                    allocated_budget: team.initial_budget - team.remaining_budget,
                                                    budget_utilization_percentage: ((team.initial_budget - team.remaining_budget) / team.initial_budget) * 100
                                                }}
                                                metrics={{
                                                    avg_player_cost: team.players_count ? team.total_spent / team.players_count : 0,
                                                    total_players: team.players_count,
                                                    total_cost: team.total_spent,
                                                    remaining_budget: team.remaining_budget,
                                                    budget_utilization: ((team.initial_budget - team.remaining_budget) / team.initial_budget) * 100
                                                }}
                                                onBudgetUpdate={handleBudgetUpdate}
                                                isAdminView={true}
                                            />
                                        </Box>
                                    </TabPanel>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </div>
    );
} 