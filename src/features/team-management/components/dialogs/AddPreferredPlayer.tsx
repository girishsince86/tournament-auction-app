import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Checkbox,
    Avatar,
    Paper,
    Alert,
    AlertTitle,
    TextField,
    InputAdornment,
    Chip,
    CircularProgress,
    Box,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { PlayerWithCategory } from '../../utils/team-composition';
import type { SimulationState, ValidationResult } from '../../hooks/useTeamSimulation';
import type { PositionConfig, SkillLevelConfig as SkillConfig, CategoryConfig } from '../../constants/index';
import type { FilterState } from '../../types/filter';
import { PlayerChip } from '../shared/PlayerChip';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS } from '../../constants/index';
import { FilterBar } from '../shared/FilterBar';
import { useFiltersAndSort } from '../../hooks/useFiltersAndSort';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatPointsInCrores } from '@/lib/utils/format';

interface AddPreferredPlayerProps {
    open: boolean;
    onClose: () => void;
    onAdd: (selectedPlayers: { player_id: string; max_bid: number }[]) => Promise<void>;
    teamId: string;
    availablePlayers: PlayerWithCategory[];
}

export function AddPreferredPlayer({
    open,
    onClose,
    onAdd,
    teamId,
    availablePlayers
}: AddPreferredPlayerProps) {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [maxBids, setMaxBids] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const {
        filterState,
        setFilterState,
        handleClearFilters,
        filterPlayers,
        sortPlayers
    } = useFiltersAndSort();

    // Add category to filter state
    useEffect(() => {
        if (selectedCategory) {
            setFilterState({
                ...filterState,
                category: selectedCategory
            });
        }
    }, [selectedCategory, filterState]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedPlayers([]);
            setMaxBids({});
            setError(null);
            setSelectedCategory('');
            handleClearFilters();
        }
    }, [open]);

    // Get unique categories from available players
    const categories = Array.from(new Set(availablePlayers.map(player => player.category?.category_type))).filter(Boolean);

    // Apply filters including category
    const filteredPlayers = sortPlayers(filterPlayers(availablePlayers.filter(player => 
        !selectedCategory || player.category?.category_type === selectedCategory
    )));

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredPlayers.reduce((acc, player) => ({
                ...acc,
                [player.id]: player.base_price
            }), {});
            setMaxBids(newSelected);
            setSelectedPlayers(Object.keys(newSelected));
        } else {
            setMaxBids({});
            setSelectedPlayers([]);
        }
    };

    const handleSelectPlayer = (playerId: string, basePrice: number) => {
        setMaxBids(prev => {
            if (prev[playerId] !== undefined) {
                const { [playerId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [playerId]: basePrice };
        });
        setSelectedPlayers(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            }
            return [...prev, playerId];
        });
    };

    const handleMaxBidChange = (playerId: string, value: number) => {
        const player = availablePlayers.find(p => p.id === playerId);
        if (!player) return;

        // Round to nearest 10 lakhs
        const roundedValue = Math.round(value / 1000000) * 1000000;
        
        if (roundedValue < player.base_price) {
            setError(`Max bid must be at least ${formatPointsInCrores(player.base_price)} points`);
            return;
        }

        setMaxBids(prev => ({
            ...prev,
            [playerId]: roundedValue
        }));
        setError(null);
    };

    const handleAdd = async () => {
        try {
            setIsAdding(true);
            setError(null);

            const selectedPlayersData = selectedPlayers.map(playerId => ({
                player_id: playerId,
                max_bid: maxBids[playerId]
            }));

            await onAdd(selectedPlayersData);
            setSelectedPlayers([]);
            setMaxBids({});
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add selected players');
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        setSelectedPlayers([]);
        setMaxBids({});
        setError(null);
        onClose();
    };

    const getPositionConfig = (position: string): PositionConfig => 
        POSITIONS.find((p: PositionConfig) => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string): SkillConfig => 
        SKILL_LEVELS.find((s: SkillConfig) => s.value === skill) || SKILL_LEVELS[0];

    const getCategoryConfig = (category?: string) =>
        CATEGORY_LABELS.find(c => c.value === category) || CATEGORY_LABELS[0];

    const numSelected = selectedPlayers.length;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>Add Preferred Players</DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <FilterBar
                        filterState={filterState}
                        onFilterChange={setFilterState}
                        onClearFilters={handleClearFilters}
                        showCategoryFilter={true}
                    />

                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={numSelected > 0 && numSelected < filteredPlayers.length}
                                            checked={numSelected === filteredPlayers.length && filteredPlayers.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    <TableCell>Player</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Position</TableCell>
                                    <TableCell>Skill Level</TableCell>
                                    <TableCell align="right">Base Points</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Maximum bid must be at least equal to the base points.">
                                            <span>Maximum Bid</span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPlayers.map((player) => {
                                    const isSelected = selectedPlayers.includes(player.id);
                                    const basePrice = player.base_price;
                                    const maxBid = maxBids[player.id] || basePrice;

                                    return (
                                        <TableRow
                                            key={player.id}
                                            hover
                                            onClick={() => handleSelectPlayer(player.id, basePrice)}
                                            selected={isSelected}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    {player.profile_image_url && (
                                                        <Avatar
                                                            src={player.profile_image_url}
                                                            alt={player.name}
                                                            sx={{ width: 40, height: 40 }}
                                                        />
                                                    )}
                                                    <Typography>{player.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                {player.category && (
                                                    <Chip
                                                        label={player.category.name || player.category.category_type}
                                                        color="primary"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getCategoryConfig(player.category.category_type).color
                                                        }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <PlayerChip
                                                    label={player.player_position}
                                                    config={getPositionConfig(player.player_position)}
                                                    type="position"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <PlayerChip
                                                    label={player.skill_level}
                                                    config={getSkillConfig(player.skill_level)}
                                                    type="skill"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {basePrice.toLocaleString()} points
                                            </TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                <Stack 
                                                    spacing={2} 
                                                    sx={{ 
                                                        width: '100%',
                                                        minWidth: 300,
                                                        px: 1 
                                                    }}
                                                >
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={maxBid}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value);
                                                            handleMaxBidChange(player.id, value);
                                                        }}
                                                        disabled={!isSelected}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="end">points</InputAdornment>,
                                                            inputProps: {
                                                                step: 1000000 // Step in 10 lakhs
                                                            }
                                                        }}
                                                        fullWidth
                                                        label="Maximum Bid"
                                                    />
                                                    <Slider
                                                        value={maxBid}
                                                        onChange={(_, value) => handleMaxBidChange(player.id, value as number)}
                                                        min={basePrice}
                                                        max={basePrice * 2}
                                                        step={1000000} // Step in 10 lakhs
                                                        disabled={!isSelected}
                                                        valueLabelDisplay="auto"
                                                        valueLabelFormat={(value) => `${(value/1000000).toFixed(1)}0L points`}
                                                    />
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredPlayers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {availablePlayers.length === 0 
                                                    ? "No available players found" 
                                                    : "No players match the current filters"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isAdding}>Cancel</Button>
                <Button 
                    onClick={handleAdd}
                    variant="contained"
                    disabled={selectedPlayers.length === 0 || isAdding}
                >
                    {isAdding ? 'Adding...' : `Add ${selectedPlayers.length} Player${selectedPlayers.length !== 1 ? 's' : ''}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 