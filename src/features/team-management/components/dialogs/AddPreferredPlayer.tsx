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
import type { PlayerWithPreference } from '../../types/player';
import type { SimulationState, ValidationResult } from '../../hooks/useTeamSimulation';
import type { PositionConfig, SkillLevelConfig as SkillConfig, CategoryConfig } from '../../constants/index';
import type { FilterState } from '../../types/filter';
import { PlayerChip } from '../shared/PlayerChip';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS } from '../../constants/index';
import { FilterBar } from '../shared/FilterBar';
import { useFiltersAndSort } from '../../hooks/useFiltersAndSort';

interface AddPreferredPlayerProps {
    open: boolean;
    onClose: () => void;
    onAdd: (selectedPlayers: { player_id: string; max_bid: number }[]) => Promise<void>;
    teamId: string;
    availablePlayers: PlayerWithPreference[];
}

export function AddPreferredPlayer({
    open,
    onClose,
    onAdd,
    teamId,
    availablePlayers
}: AddPreferredPlayerProps) {
    const [selectedPlayers, setSelectedPlayers] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Filter non-preferred players
    const nonPreferredPlayers = availablePlayers.filter(player => !player.is_preferred);

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
            setSelectedPlayers({});
            setError(null);
            setSelectedCategory('');
            handleClearFilters();
        }
    }, [open]);

    // Get unique categories from available players
    const categories = Array.from(new Set(nonPreferredPlayers.map(player => player.category?.category_type))).filter(Boolean);

    // Apply filters including category
    const filteredPlayers = sortPlayers(filterPlayers(nonPreferredPlayers.filter(player => 
        !selectedCategory || player.category?.category_type === selectedCategory
    )));

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredPlayers.reduce((acc, player) => ({
                ...acc,
                [player.id]: player.base_price
            }), {});
            setSelectedPlayers(newSelected);
        } else {
            setSelectedPlayers({});
        }
    };

    const handleSelectPlayer = (playerId: string, basePrice: number) => {
        setSelectedPlayers(prev => {
            if (prev[playerId] !== undefined) {
                const { [playerId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [playerId]: basePrice };
        });
    };

    const handleMaxBidChange = (playerId: string, value: number) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [playerId]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setError(null);
            setIsSubmitting(true);
            
            if (Object.keys(selectedPlayers).length === 0) {
                setError('Please select at least one player');
                setIsSubmitting(false);
                return;
            }
            
            const selectedPlayersList = Object.entries(selectedPlayers).map(([playerId, maxBid]) => ({
                player_id: playerId,
                max_bid: maxBid
            }));
            
            await onAdd(selectedPlayersList);
            onClose();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setError(error instanceof Error ? error.message : 'Failed to add players');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPositionConfig = (position: string) => 
        POSITIONS.find(p => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string) => 
        SKILL_LEVELS.find(s => s.value === skill) || SKILL_LEVELS[0];

    const getCategoryConfig = (category?: string) =>
        CATEGORY_LABELS.find(c => c.value === category) || CATEGORY_LABELS[0];

    const numSelected = Object.keys(selectedPlayers).length;

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                                    const isSelected = selectedPlayers[player.id] !== undefined;
                                    const basePrice = player.base_price;
                                    const maxBid = selectedPlayers[player.id] || basePrice;

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
                                                            // Round to nearest 10 lakhs
                                                            const roundedValue = Math.round(value / 1000000) * 1000000;
                                                            if (roundedValue >= basePrice) {
                                                                handleMaxBidChange(player.id, roundedValue);
                                                            }
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
                                                {nonPreferredPlayers.length === 0 
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
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={Object.keys(selectedPlayers).length === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Adding...
                        </>
                    ) : (
                        `Add ${Object.keys(selectedPlayers).length} Selected Player${Object.keys(selectedPlayers).length !== 1 ? 's' : ''}`
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 