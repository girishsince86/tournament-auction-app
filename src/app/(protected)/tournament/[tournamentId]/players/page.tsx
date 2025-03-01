'use client';

import { useState, useEffect } from 'react';
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
    TablePagination,
    Chip,
    IconButton,
    Button,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { PlayerProfile } from '@/types/auction';
import { PlayerPosition, SkillLevel } from '@/types/database';
import { formatPointsInCrores } from '@/lib/utils/format';

// Update positions to match registration form
const POSITIONS = [
    { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
    { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
    { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
    { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
    { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
    { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' }
];

// Update skill levels to match registration form
const SKILL_LEVELS = [
    { value: 'COMPETITIVE_A', label: 'Competitive' },
    { value: 'UPPER_INTERMEDIATE_BB', label: 'Upper Intermediate' },
    { value: 'INTERMEDIATE_B', label: 'Intermediate' },
    { value: 'RECREATIONAL_C', label: 'Recreational' }
];

interface TournamentPlayersProps {
    params: {
        tournamentId: string;
    };
}

export default function TournamentPlayers({ params: { tournamentId } }: TournamentPlayersProps) {
    // State management
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [positionFilter, setPositionFilter] = useState<string>('');
    const [skillFilter, setSkillFilter] = useState<string>('');
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Fetch players data
    useEffect(() => {
        async function fetchPlayers() {
            try {
                setLoading(true);
                const response = await fetch(`/api/tournaments/${tournamentId}/players`);
                if (!response.ok) {
                    throw new Error('Failed to fetch players');
                }
                const data = await response.json();
                setPlayers(data.players);
            } catch (err) {
                console.error('Error fetching players:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch players');
            } finally {
                setLoading(false);
            }
        }

        fetchPlayers();
    }, [tournamentId]);

    // Filter players based on search and filters
    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPosition = !positionFilter || player.player_position === positionFilter;
        const matchesSkill = !skillFilter || player.skill_level === skillFilter;
        return matchesSearch && matchesPosition && matchesSkill;
    });

    // Pagination handlers
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Edit handlers
    const handleEditClick = (player: PlayerProfile) => {
        setSelectedPlayer(player);
        setIsEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setSelectedPlayer(null);
        setIsEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        if (!selectedPlayer) return;

        try {
            const response = await fetch(`/api/players/${selectedPlayer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedPlayer),
            });

            if (!response.ok) {
                throw new Error('Failed to update player');
            }

            // Update local state
            setPlayers(players.map(p => 
                p.id === selectedPlayer.id ? selectedPlayer : p
            ));
            handleEditClose();
        } catch (err) {
            console.error('Error updating player:', err);
            setError(err instanceof Error ? err.message : 'Failed to update player');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Tournament Players
                </Typography>
                <Typography color="text.secondary">
                    View and manage players registered for this tournament
                </Typography>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        label="Search Players"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Position</InputLabel>
                        <Select
                            value={positionFilter}
                            label="Position"
                            onChange={(e) => setPositionFilter(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            {POSITIONS.map(pos => (
                                <MenuItem key={pos.value} value={pos.value}>{pos.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Skill Level</InputLabel>
                        <Select
                            value={skillFilter}
                            label="Skill Level"
                            onChange={(e) => setSkillFilter(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            {SKILL_LEVELS.map(level => (
                                <MenuItem key={level.value} value={level.value}>{level.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Players Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Skill Level</TableCell>
                            <TableCell>Base Points</TableCell>
                            <TableCell>Height (cm)</TableCell>
                            <TableCell>Last Played</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPlayers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((player) => (
                                <TableRow key={player.id}>
                                    <TableCell>{player.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={POSITIONS.find(pos => pos.value === player.player_position)?.label}
                                            size="small"
                                            icon={<SportsVolleyballIcon />}
                                            sx={{
                                                bgcolor: 'secondary.main',
                                                color: 'white',
                                                '& .MuiChip-icon': {
                                                    color: 'white',
                                                    transform: 'rotate(-45deg)'
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={SKILL_LEVELS.find(level => level.value === player.skill_level)?.label}
                                            size="small"
                                            color={
                                                player.skill_level === 'COMPETITIVE_A' ? 'error' :
                                                player.skill_level === 'UPPER_INTERMEDIATE_BB' ? 'warning' :
                                                player.skill_level === 'INTERMEDIATE_B' ? 'info' : 'success'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>{formatPointsInCrores(player.base_price)}</TableCell>
                                    <TableCell>{player.height || 'N/A'}</TableCell>
                                    <TableCell>{player.registration_data?.last_played_date || 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditClick(player)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredPlayers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Edit Dialog */}
            <Dialog 
                open={isEditDialogOpen} 
                onClose={handleEditClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Player</DialogTitle>
                <DialogContent>
                    {selectedPlayer && (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <TextField
                                label="Name"
                                value={selectedPlayer.name}
                                onChange={(e) => setSelectedPlayer({
                                    ...selectedPlayer,
                                    name: e.target.value
                                })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Position</InputLabel>
                                <Select
                                    value={selectedPlayer.player_position}
                                    label="Position"
                                    onChange={(e) => setSelectedPlayer({
                                        ...selectedPlayer,
                                        player_position: e.target.value as PlayerPosition
                                    })}
                                >
                                    {POSITIONS.map(pos => (
                                        <MenuItem key={pos.value} value={pos.value}>
                                            {pos.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Skill Level</InputLabel>
                                <Select
                                    value={selectedPlayer.skill_level}
                                    label="Skill Level"
                                    onChange={(e) => setSelectedPlayer({
                                        ...selectedPlayer,
                                        skill_level: e.target.value as SkillLevel
                                    })}
                                >
                                    {SKILL_LEVELS.map(level => (
                                        <MenuItem key={level.value} value={level.value}>
                                            {level.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Base Points"
                                type="number"
                                value={selectedPlayer.base_price}
                                onChange={(e) => setSelectedPlayer({
                                    ...selectedPlayer,
                                    base_price: parseInt(e.target.value)
                                })}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">{formatPointsInCrores(selectedPlayer.base_price)}</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Height (cm)"
                                type="number"
                                value={selectedPlayer.height || ''}
                                onChange={(e) => setSelectedPlayer({
                                    ...selectedPlayer,
                                    height: parseInt(e.target.value)
                                })}
                                fullWidth
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 