'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { 
    Box, 
    Card, 
    Typography, 
    IconButton, 
    List, 
    ListItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import { useAuctionQueue } from '@/hooks/useAuctionQueue';
import { useAvailablePlayers } from '@/hooks/useAvailablePlayers';
import { PlayerProfile, QueueItemWithPlayer } from '@/types/auction';
import { formatPointsInCrores } from '@/lib/utils/format';

interface QueueManagerProps {
    tournamentId: string;
}

export function QueueManager({ tournamentId }: QueueManagerProps) {
    const { 
        queue, 
        isLoading: isQueueLoading, 
        error: queueError,
        fetchQueue,
        addToQueue,
        removeFromQueue,
        updateQueuePositions
    } = useAuctionQueue({ tournamentId });

    const {
        players: availablePlayers,
        isLoading: isPlayersLoading,
        error: playersError,
        fetchPlayers
    } = useAvailablePlayers({ tournamentId });

    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [skillLevelFilter, setSkillLevelFilter] = useState<string>('');
    const [selectedQueueItems, setSelectedQueueItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchQueue();
        fetchPlayers();
    }, [fetchQueue, fetchPlayers]);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        
        if (sourceIndex === destinationIndex) return;

        const itemId = queue[sourceIndex].id;
        const newPosition = destinationIndex + 1;

        try {
            await updateQueuePositions(itemId, newPosition);
        } catch (error) {
            console.error('Failed to reorder queue:', error);
        }
    };

    const handleAddPlayers = async () => {
        if (selectedPlayers.size === 0) return;

        try {
            const playerIds = Array.from(selectedPlayers);
            for (const playerId of playerIds) {
                await addToQueue(playerId);
            }
            setIsAddPlayerOpen(false);
            setSelectedPlayers(new Set());
            setSearchQuery('');
            fetchPlayers();
        } catch (error) {
            console.error('Failed to add players to queue:', error);
        }
    };

    const handleRemoveSelectedPlayers = async () => {
        if (selectedQueueItems.size === 0) return;

        try {
            const queueItemIds = Array.from(selectedQueueItems);
            for (const queueItemId of queueItemIds) {
                await removeFromQueue(queueItemId);
            }
            setSelectedQueueItems(new Set());
            fetchPlayers();
        } catch (error) {
            console.error('Failed to remove players from queue:', error);
        }
    };

    const togglePlayerSelection = (playerId: string) => {
        const newSelection = new Set(selectedPlayers);
        if (newSelection.has(playerId)) {
            newSelection.delete(playerId);
        } else {
            newSelection.add(playerId);
        }
        setSelectedPlayers(newSelection);
    };

    const toggleQueueItemSelection = (queueItemId: string) => {
        const newSelection = new Set(selectedQueueItems);
        if (newSelection.has(queueItemId)) {
            newSelection.delete(queueItemId);
        } else {
            newSelection.add(queueItemId);
        }
        setSelectedQueueItems(newSelection);
    };

    const filteredPlayers = availablePlayers.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSkillLevel = !skillLevelFilter || player.skill_level === skillLevelFilter;
        return matchesSearch && matchesSkillLevel;
    });

    if (isQueueLoading || isPlayersLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (queueError || playersError) {
        return (
            <Alert severity="error">
                {queueError || playersError}
            </Alert>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Auction Queue</Typography>
                <Box display="flex" gap={1}>
                    {selectedQueueItems.size > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRemoveSelectedPlayers}
                        >
                            Remove Selected ({selectedQueueItems.size})
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddPlayerOpen(true)}
                    >
                        Add Players
                    </Button>
                </Box>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="queue">
                    {(provided: DroppableProvided) => (
                        <List
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{ bgcolor: 'background.paper' }}
                        >
                            {queue.map((item: QueueItemWithPlayer, index: number) => (
                                <Draggable 
                                    key={item.id} 
                                    draggableId={item.id} 
                                    index={index}
                                >
                                    {(provided: DraggableProvided) => (
                                        <ListItem
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            sx={{ 
                                                mb: 1,
                                                bgcolor: selectedQueueItems.has(item.id) 
                                                    ? 'action.selected' 
                                                    : item.is_processed 
                                                    ? 'action.hover' 
                                                    : 'background.paper',
                                                borderRadius: 1,
                                                border: 1,
                                                borderColor: 'divider'
                                            }}
                                            onClick={() => toggleQueueItemSelection(item.id)}
                                        >
                                            <Box
                                                {...provided.dragHandleProps}
                                                sx={{ mr: 2, cursor: 'grab' }}
                                            >
                                                <DragIndicatorIcon />
                                            </Box>
                                            <Box flexGrow={1}>
                                                <Typography variant="subtitle1">
                                                    {item.queue_position}. {item.player?.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Base Price: {item.player ? formatPointsInCrores(item.player.base_price) : 'N/A'} | 
                                                    Skill Level: {item.player?.skill_level}
                                                </Typography>
                                            </Box>
                                            <IconButton 
                                                edge="end" 
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveSelectedPlayers();
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </List>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Add Players Dialog */}
            <Dialog 
                open={isAddPlayerOpen} 
                onClose={() => {
                    setIsAddPlayerOpen(false);
                    setSelectedPlayers(new Set());
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Players to Queue</DialogTitle>
                <DialogContent>
                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            margin="dense"
                            label="Search Players"
                            fullWidth
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                            <InputLabel>Skill Level</InputLabel>
                            <Select
                                value={skillLevelFilter}
                                onChange={(e) => setSkillLevelFilter(e.target.value)}
                                label="Skill Level"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="COMPETITIVE_A">Competitive A</MenuItem>
                                <MenuItem value="UPPER_INTERMEDIATE_BB">Upper Intermediate BB</MenuItem>
                                <MenuItem value="INTERMEDIATE_B">Intermediate B</MenuItem>
                                <MenuItem value="RECREATIONAL_C">Recreational C</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {filteredPlayers.map((player) => (
                            <ListItem 
                                key={player.id}
                                onClick={() => togglePlayerSelection(player.id)}
                                sx={{ 
                                    cursor: 'pointer',
                                    bgcolor: selectedPlayers.has(player.id) ? 'action.selected' : 'inherit',
                                    '&:hover': { bgcolor: 'action.hover' },
                                    borderRadius: 1,
                                    mb: 1
                                }}
                            >
                                <Box flexGrow={1}>
                                    <Typography variant="subtitle1">
                                        {player.name}
                                    </Typography>
                                    <Box display="flex" gap={1} mt={0.5}>
                                        <Chip 
                                            label={`${formatPointsInCrores(player.base_price)}`}
                                            size="small"
                                            color="default"
                                        />
                                        <Chip 
                                            label={player.skill_level}
                                            size="small"
                                            color="secondary"
                                        />
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsAddPlayerOpen(false);
                        setSelectedPlayers(new Set());
                    }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddPlayers}
                        variant="contained"
                        disabled={selectedPlayers.size === 0}
                    >
                        Add Selected ({selectedPlayers.size})
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 