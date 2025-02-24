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
    Chip
} from '@mui/material';
import type { PlayerWithPreference } from '../../types';
import type { SimulationState, ValidationResult } from '../../hooks/useTeamSimulation';
import type { PositionConfig, SkillConfig, CategoryConfig } from '../../constants';
import { PlayerChip } from '../shared/PlayerChip';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS } from '../../constants';

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

    useEffect(() => {
        // Reset selections when dialog opens/closes
        if (!open) {
            setSelectedPlayers({});
        }
    }, [open]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = availablePlayers.reduce((acc, player) => ({
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

    const handleMaxBidChange = (playerId: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setSelectedPlayers(prev => ({
            ...prev,
            [playerId]: numValue
        }));
    };

    const handleSubmit = async () => {
        try {
            console.log('Selected players state:', selectedPlayers); // Debug log
            
            const selectedPlayersList = Object.entries(selectedPlayers).map(([playerId, maxBid]) => {
                console.log(`Processing player ${playerId} with max bid ${maxBid}`); // Debug log
                return {
                    player_id: playerId,
                    max_bid: maxBid
                };
            });
            
            console.log('Formatted selected players:', selectedPlayersList); // Debug log
            
            if (selectedPlayersList.length === 0) {
                console.warn('No players selected'); // Debug log
                return;
            }
            
            await onAdd(selectedPlayersList);
            console.log('onAdd completed successfully'); // Debug log
            onClose();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
        }
    };

    const getPositionConfig = (position: string) => 
        POSITIONS.find(p => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string) => 
        SKILL_LEVELS.find(s => s.value === skill) || SKILL_LEVELS[0];

    const numSelected = Object.keys(selectedPlayers).length;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                Add Preferred Players
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={numSelected > 0 && numSelected < availablePlayers.length}
                                        checked={numSelected === availablePlayers.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Player</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Skill Level</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Base Price</TableCell>
                                <TableCell align="right">Max Bid</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {availablePlayers.map((player) => {
                                const isSelected = selectedPlayers[player.id] !== undefined;
                                return (
                                    <TableRow
                                        key={player.id}
                                        hover
                                        onClick={() => handleSelectPlayer(player.id, player.base_price)}
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        selected={isSelected}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isSelected} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{player.name}</Typography>
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
                                        <TableCell>
                                            {player.category ? (
                                                <Chip
                                                    label={player.category.name || player.category.category_type}
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: CATEGORY_LABELS.find(c => c.value === player.category?.category_type)?.color
                                                    }}
                                                />
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            ₹{player.base_price.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={selectedPlayers[player.id] || ''}
                                                onChange={(e) => handleMaxBidChange(player.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={!isSelected}
                                                InputProps={{
                                                    startAdornment: '₹',
                                                    inputProps: { min: player.base_price }
                                                }}
                                                sx={{ width: 120 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={numSelected === 0}
                >
                    Add Selected Players ({numSelected})
                </Button>
            </DialogActions>
        </Dialog>
    );
} 