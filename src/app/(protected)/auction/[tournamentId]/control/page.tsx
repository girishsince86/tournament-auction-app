'use client';

import { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Tabs,
    Tab,
    Checkbox,
    Avatar,
    Divider,
    Collapse,
    Fade,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Tooltip
} from '@mui/material';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTeams } from '@/hooks/useTeams';
import { useAuctionQueue } from '@/hooks/useAuctionQueue';
import { useAvailablePlayers } from '@/hooks/useAvailablePlayers';
import { PlayerProfile, QueueItemWithPlayer, TimerConfig } from '@/types/auction';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import DeleteIcon from '@mui/icons-material/Delete';
import { Timer, TimerHandle } from '@/components/auction/Timer';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import StarIcon from '@mui/icons-material/Star';
import HeightIcon from '@mui/icons-material/Height';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import GroupsIcon from '@mui/icons-material/Groups';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import { formatPointsInCrores, convertCroresToPoints } from '@/lib/utils/format';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useToast, ToastProvider } from '@/components/providers/toast-provider';
import InfoIcon from '@mui/icons-material/Info';
import UndoIcon from '@mui/icons-material/Undo';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchWithAuth } from '@/lib/utils/api-client';
import BugReportIcon from '@mui/icons-material/BugReport';

interface AuctionControlProps {
    params: {
        tournamentId: string;
    };
}

// Update positions to match registration form
const VOLLEYBALL_POSITIONS = [
    { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
    { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
    { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
    { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
    { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
    { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' }
];

const THROWBALL_POSITIONS = [
    { value: 'ANY_POSITION', label: 'Any Position' }
];

// Combined positions for label lookups across all sports
const ALL_POSITIONS = [...VOLLEYBALL_POSITIONS, ...THROWBALL_POSITIONS];

// Update skill levels to match registration form
const SKILL_LEVELS = [
    { value: 'COMPETITIVE_A', label: 'Competitive' },
    { value: 'UPPER_INTERMEDIATE_BB', label: 'Upper Intermediate' },
    { value: 'INTERMEDIATE_B', label: 'Intermediate' },
    { value: 'RECREATIONAL_C', label: 'Recreational' }
];

// Add this function after SKILL_LEVELS constant
const getSkillLevelStyling = (skillLevel: string | undefined) => {
    switch (skillLevel) {
        case 'COMPETITIVE_A':
            return {
                bgcolor: 'error.main',
                color: 'white',
                '& .MuiChip-icon': {
                    color: 'white'
                },
                '&:hover': {
                    bgcolor: 'error.dark'
                }
            };
        case 'UPPER_INTERMEDIATE_BB':
            return {
                bgcolor: 'warning.main',
                color: 'white',
                '& .MuiChip-icon': {
                    color: 'white'
                },
                '&:hover': {
                    bgcolor: 'warning.dark'
                }
            };
        case 'INTERMEDIATE_B':
            return {
                bgcolor: 'info.main',
                color: 'white',
                '& .MuiChip-icon': {
                    color: 'white'
                },
                '&:hover': {
                    bgcolor: 'info.dark'
                }
            };
        case 'RECREATIONAL_C':
        default:
            return {
                bgcolor: 'success.main',
                color: 'white',
                '& .MuiChip-icon': {
                    color: 'white'
                },
                '&:hover': {
                    bgcolor: 'success.dark'
                }
            };
    }
};

// Add these functions after getSkillLevelStyling
const getPositionStyling = (size: 'small' | 'medium' = 'medium') => ({
    bgcolor: 'secondary.main',
    color: 'white',
    height: size === 'small' ? 24 : 32,
    '& .MuiChip-icon': {
        color: 'white',
        transform: 'rotate(-45deg)'
    },
    '&:hover': {
        bgcolor: 'secondary.dark'
    },
    transition: 'all 0.2s ease'
});

const getBasePointsStyling = (size: 'small' | 'medium' = 'medium') => ({
    fontWeight: 600,
    fontSize: size === 'small' ? '0.75rem' : '1rem',
    height: size === 'small' ? 24 : 32,
    background: 'linear-gradient(45deg, #2196f3, #1976d2)',
    color: 'white',
    '& .MuiChip-icon': {
        color: 'white'
    },
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        background: 'linear-gradient(45deg, #1976d2, #1565c0)'
    }
});

interface QueueItemWithPosition {
    id: string;
    queue_position: number;
}

// Add SortableQueueItem component
function SortableQueueItem({ item, currentPlayer, onSelectPlayer, onRemoveFromQueue }: { 
    item: QueueItemWithPlayer; 
    currentPlayer: PlayerProfile | null;
    onSelectPlayer: (player: PlayerProfile) => void;
    onRemoveFromQueue: (queueItemId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        bgcolor: currentPlayer?.id === item.player.id ? 'action.selected' : 'inherit',
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
    };

    return (
        <ListItem
            ref={setNodeRef}
            sx={style}
            {...attributes}
        >
            <IconButton size="small" sx={{ mr: 1 }} {...listeners}>
                <DragIndicatorIcon />
            </IconButton>
            <ListItemText
                primary={item.player.name}
                secondary={
                    <Stack direction="row" spacing={1}>
                        <Chip 
                            label={`Base Points: ${formatPointsInCrores(item.player.base_price)}`}
                            size="small"
                            icon={<LeaderboardIcon fontSize="small" />}
                            sx={getBasePointsStyling('small')}
                        />
                        <Chip 
                            label={ALL_POSITIONS.find(pos => pos.value === item.player.player_position)?.label || item.player.player_position}
                            size="small"
                            icon={<SportsVolleyballIcon fontSize="small" />}
                            sx={getPositionStyling('small')}
                        />
                        <Chip 
                            label={SKILL_LEVELS.find(level => level.value === item.player.skill_level)?.label || 'Unknown'}
                            size="small"
                            icon={<StarIcon fontSize="small" />}
                            sx={getSkillLevelStyling(item.player.skill_level)}
                        />
                    </Stack>
                }
            />
            <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                    <IconButton 
                        edge="end" 
                        color="error"
                        onClick={() => onRemoveFromQueue(item.id)}
                        title="Remove from queue"
                    >
                        <DeleteIcon />
                    </IconButton>
                <IconButton 
                    edge="end" 
                    onClick={() => onSelectPlayer(item.player)}
                    disabled={currentPlayer?.id === item.player.id}
                        title="Select player"
                >
                    {currentPlayer?.id === item.player.id ? (
                        <PersonIcon color="primary" />
                    ) : (
                        <ArrowForwardIcon />
                    )}
                </IconButton>
                </Stack>
            </ListItemSecondaryAction>
        </ListItem>
    );
}

// Add timer configuration
const DEFAULT_CONFIG = {
        initialCountdown: 30,
        subsequentBidTimer: 20,
        automatedCalls: {
            firstCall: 10,
            secondCall: 5,
            finalCall: 2
        },
        visualIndicators: true,
        soundEnabled: true
};

const LAST_PLAYED_OPTIONS = [
  { value: 'PLAYING_ACTIVELY', label: 'Playing Actively' },
  { value: 'NOT_PLAYED_SINCE_LAST_YEAR', label: 'Not Played since last year' },
  { value: 'NOT_PLAYED_IN_FEW_YEARS', label: 'Not played in few years' }
];

// Add type definitions for API responses
interface BidResponse {
    player: {
        id: string;
        name: string;
    };
    team: {
        id: string;
        name: string;
    };
    amount: number;
}

interface UndoBidResponse {
    player: {
        id: string;
        name: string;
    };
    team: {
        id: string;
        name: string;
    };
    points_restored: number;
}

interface MarkUnallocatedResponse {
    message: string;
    player: {
        id: string;
        name: string;
    };
}

interface CategoriesResponse {
    categories: Array<{
        id: string;
        name: string;
    }>;
}

interface ClearQueueResponse {
    message: string;
}

function AuctionControl({ params: { tournamentId } }: AuctionControlProps) {
    // State management
    const [finalBid, setFinalBid] = useState<number>(0);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    // Queue management state
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [positionFilter, setPositionFilter] = useState<string>('');
    const [skillFilter, setSkillFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    // Add state for selected players in bulk selection
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
    const [isAddingPlayers, setIsAddingPlayers] = useState(false);
    
    // Add sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Add timer ref
    const timerRef = useRef<TimerHandle>(null);

    // Add state for category filter
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    // Timer config loaded from DB (falls back to DEFAULT_CONFIG)
    const [timerConfig, setTimerConfig] = useState<TimerConfig>(DEFAULT_CONFIG);

    // Load timer config from auction_display_config table
    useEffect(() => {
        async function loadTimerConfig() {
            try {
                const res = await fetch(`/api/auction/display-config?tournamentId=${tournamentId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.config) {
                        setTimerConfig({
                            initialCountdown: data.config.initial_timer_seconds,
                            subsequentBidTimer: data.config.subsequent_timer_seconds,
                            automatedCalls: {
                                firstCall: data.config.first_call_seconds,
                                secondCall: data.config.second_call_seconds,
                                finalCall: data.config.final_call_seconds,
                            },
                            visualIndicators: data.config.enable_visual_effects,
                            soundEnabled: data.config.enable_sound,
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load timer config, using defaults:', err);
            }
        }
        loadTimerConfig();
    }, [tournamentId]);

    // Sport category selector for switching between volleyball and throwball
    const [sportCategory, setSportCategory] = useState<string>('VOLLEYBALL_OPEN_MEN');
    const activePositions = sportCategory === 'VOLLEYBALL_OPEN_MEN' ? VOLLEYBALL_POSITIONS : THROWBALL_POSITIONS;

    // Fetch teams and queue data - filtered by sport category
    const { teams, isLoading: teamsLoading, error: teamsError, fetchTeams } = useTeams({ tournamentId, sportCategory });
    const {
        queue,
        isLoading: queueLoading,
        error: queueError,
        markAsProcessed,
        fetchQueue,
        addToQueue,
        removeFromQueue
    } = useAuctionQueue({ tournamentId, sportCategory, enablePolling: false });
    const {
        players: availablePlayers,
        isLoading: playersLoading,
        error: playersError,
        refetch: fetchPlayers
    } = useAvailablePlayers({ tournamentId, sportCategory });

    const { showToast } = useToast();

    // Add timer handlers
    const handlePhaseChange = (phase: string) => {
        console.log('Timer phase changed:', phase);
    };

    const handleTimerComplete = () => {
        console.log('Timer completed');
    };

    const validateBid = (amount: number, teamId: string): string | null => {
        if (!amount || amount <= 0) {
            return 'Bid amount must be greater than 0';
        }

        const team = teams.find(t => t.id === teamId);
        if (!team) {
            return 'Invalid team selected';
        }

        // Convert amount from crores to points for comparison
        const amountInPoints = convertCroresToPoints(amount);
        const remainingBalance = team.remaining_budget;
        
        if (amountInPoints > remainingBalance) {
            return `Bid exceeds team's remaining balance (${formatPointsInCrores(remainingBalance)})`;
        }

        if (team.current_players >= team.max_players) {
            return 'Team has reached maximum player limit';
        }

        return null;
    };

    const handleRecordBid = async () => {
        if (!currentPlayer) {
            setError('No player selected');
            return;
        }

        const validationError = validateBid(finalBid, selectedTeam);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setError(''); // Clear any previous errors
            setIsSubmitting(true); // Add loading state
            
            // Convert finalBid from crores to actual points value
            const bidAmountInPoints = convertCroresToPoints(finalBid);
            
            console.log('Recording bid:', {
                tournamentId,
                playerId: currentPlayer.id,
                teamId: selectedTeam,
                amount: bidAmountInPoints
            });
            
            const data = await fetchWithAuth<BidResponse>('/api/auction/bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    playerId: currentPlayer.id,
                    teamId: selectedTeam,
                    amount: bidAmountInPoints,
                    sportCategory,
                }),
            });

            // Show success message
            showToast({
                message: `${currentPlayer.name} has been allocated to ${teams.find(t => t.id === selectedTeam)?.name}`,
                type: 'success'
            });
            
            // Mark current queue item as processed
            const queueItem = queue.find(item => item.player.id === currentPlayer.id);
            if (queueItem) {
                await markAsProcessed(queueItem.id);
                await fetchQueue(); // Refresh queue
            }

            // Refresh teams data
            await fetchTeams();

            // Reset form after successful operation
            setError('');
            setCurrentPlayer(null);
            setFinalBid(0);
            setSelectedTeam('');
        } catch (error) {
            console.error('Error recording bid:', error);
            setError('Failed to record bid. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false); // Reset loading state
        }
    };

    const handleUndoBid = async () => {
        if (!currentPlayer) {
            setError('No player selected');
            return;
        }

        try {
            setError(''); // Clear any previous errors
            setIsSubmitting(true); // Add loading state
            
            console.log('Undoing bid for player:', currentPlayer.id);
            
            const data = await fetchWithAuth<UndoBidResponse>('/api/auction/undo-bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId: currentPlayer.id,
                }),
            });

            // Show success message
            showToast({
                message: `Bid undone for ${currentPlayer.name}`,
                type: 'success'
            });
            
            // Mark current queue item as processed
            const queueItem = queue.find(item => item.player.id === currentPlayer.id);
            if (queueItem) {
                await markAsProcessed(queueItem.id);
                await fetchQueue(); // Refresh queue
            }

            // Refresh teams data
            await fetchTeams();

            // Reset form after successful operation
            setError('');
            setCurrentPlayer(null);
            setFinalBid(0);
            setSelectedTeam('');
        } catch (error) {
            console.error('Error undoing bid:', error);
            setError('Failed to undo bid. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false); // Reset loading state
        }
    };

    const handleMarkUnallocated = async () => {
        if (!currentPlayer) {
            setError('No player selected');
            return;
        }

        try {
            setError(''); // Clear any previous errors
            setIsSubmitting(true); // Add loading state
            
            console.log('Marking player as UNALLOCATED:', {
                playerId: currentPlayer.id
            });
            
            const data = await fetchWithAuth<MarkUnallocatedResponse>('/api/auction/mark-unallocated', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId: currentPlayer.id,
                    tournamentId,
                }),
            });

            console.log('Player marked as UNALLOCATED successfully:', data);
            
            // Show success message
            showToast({
                message: `${currentPlayer.name} has been marked as UNALLOCATED`,
                type: 'success'
            });
            
            // Mark current queue item as processed
            const queueItem = queue.find(item => item.player.id === currentPlayer.id);
            if (queueItem) {
                await markAsProcessed(queueItem.id);
                await fetchQueue(); // Refresh queue
            }

            // Refresh players data
            await fetchPlayers();

            // Reset form after successful operation
            setError('');
            setCurrentPlayer(null); // Clear current player
        } catch (error) {
            console.error('Error marking player as UNALLOCATED:', error);
            setError('Failed to mark player as UNALLOCATED. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false); // Reset loading state
        }
    };

    const handleSelectPlayer = (player: PlayerProfile) => {
        setCurrentPlayer(player);
        setFinalBid(0);
        setSelectedTeam('');
        setError('');
        
        // Add detailed debug logging
        console.log('Selected player:', player);
        console.log('Selected player height:', player.height);
        console.log('Selected player registration_data:', player.registration_data);
        
        // Check if registration_data exists
        if (player.registration_data) {
            console.log('Registration data keys:', Object.keys(player.registration_data));
            
            // Try to access different possible field names for last played date
            console.log('last_played_date:', player.registration_data.last_played_date);
            console.log('last_played:', player.registration_data.last_played);
            console.log('lastPlayed:', player.registration_data.lastPlayed);
            console.log('playing_status:', player.registration_data.playing_status);
            
            // Check if registration_data might be a string that needs parsing
            if (typeof player.registration_data === 'string') {
                console.log('Registration data is a string, attempting to parse...');
                try {
                    const parsedData = JSON.parse(player.registration_data);
                    console.log('Successfully parsed registration_data:', parsedData);
                    console.log('Parsed data keys:', Object.keys(parsedData));
                } catch (e) {
                    console.log('Failed to parse registration_data as JSON:', e);
                }
            }
            
            // Log the raw registration_data as a string to see its structure
            console.log('Raw registration_data:', JSON.stringify(player.registration_data, null, 2));
        } else {
            console.log('No registration_data available for this player');
            console.log('Using default "Playing Actively" for Last Played status');
        }
    };

    const handleAddToQueue = async (player: PlayerProfile) => {
        try {
            // Set loading state to true
            setIsAddingPlayers(true);
            
            await addToQueue(player.id, queue.length + 1);
            setIsAddPlayerOpen(false);
        } catch (error) {
            console.error('Error adding player to queue:', error);
            setError('Failed to add player to queue');
        } finally {
            // Reset loading state
            setIsAddingPlayers(false);
        }
    };

    // Fetch player categories from the API
    const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await fetchWithAuth<CategoriesResponse>(`/api/tournaments/${tournamentId}/categories`);
                setCategories(data.categories || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        
        fetchCategories();
    }, [tournamentId]);

    // Restore the filteredQueue definition
    const filteredQueue = queue
        .filter(item => !item.is_processed)
        .filter(item => !positionFilter || item.player.player_position === positionFilter)
        .filter(item => !skillFilter || item.player.skill_level === skillFilter);

    // Modify the filteredAvailablePlayers to include category filter and both AVAILABLE and UNALLOCATED statuses
    const filteredAvailablePlayers = availablePlayers
        .filter(player => !queue.some(item => item.player_id === player.id))
        .filter(player => !positionFilter || player.player_position === positionFilter)
        .filter(player => !skillFilter || player.skill_level === skillFilter)
        .filter(player => !categoryFilter || player.category_id === categoryFilter)
        .filter(player => 
            !searchQuery || 
            player.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(player => player.status === 'AVAILABLE' || player.status === 'UNALLOCATED');

    // Inside the AuctionControl component, add a useEffect to log the availablePlayers
    useEffect(() => {
        console.log('[AuctionControl] availablePlayers length:', availablePlayers.length);
        
        // Count players by status
        const statusCounts = availablePlayers.reduce((acc, player) => {
            const status = player.status || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log('[AuctionControl] Player status counts:', statusCounts);
        
        // Log UNALLOCATED players
        const unallocatedPlayers = availablePlayers.filter(p => p.status === 'UNALLOCATED');
        console.log('[AuctionControl] UNALLOCATED players count:', unallocatedPlayers.length);
        
        if (unallocatedPlayers.length > 0) {
            console.log('[AuctionControl] UNALLOCATED player names:', 
                unallocatedPlayers.map(p => p.name));
        }
    }, [availablePlayers]);

    // DEBUG: Add a button to manually refresh available players
    const handleManualRefresh = () => {
        console.log('[AuctionControl] Manually refreshing available players');
        fetchPlayers();
    };

    // Use the fetched categories or fallback to available player category IDs
    const playerCategories = categories.length > 0 
        ? categories 
        : availablePlayers
            .filter(player => player.category_id)
            .map(player => ({
                id: player.category_id,
                name: `Category ${player.category_id}` // Fallback name
            }))
            .filter((category, index, self) => 
                index === self.findIndex(c => c.id === category.id)
        );

    // Add handler for drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            const oldIndex = filteredQueue.findIndex(item => item.id === active.id);
            const newIndex = filteredQueue.findIndex(item => item.id === over.id);
            
            // Update local state immediately for smooth UX
            const newQueue = arrayMove(filteredQueue, oldIndex, newIndex);
            
            // Update queue positions in the backend
            try {
                await fetchWithAuth('/api/auction/queue/reorder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tournamentId,
                        queueItems: newQueue.map((item: QueueItemWithPlayer, index: number): QueueItemWithPosition => ({
                            id: item.id,
                            queue_position: index + 1,
                        })),
                    }),
                });
                
                // Refresh queue after successful reorder
                fetchQueue();
            } catch (error) {
                console.error('Error reordering queue:', error);
                setError('Failed to reorder queue');
            }
        }
    };

    // Add handler for bulk selection
    const handleBulkAddToQueue = async () => {
        try {
            // Set loading state to true
            setIsAddingPlayers(true);
            
            const playerIds = Array.from(selectedPlayers);
            console.log(`Adding ${playerIds.length} players to queue`);
            
            // Add all players in a single batch, only refreshing the UI once at the end
            const promises = playerIds.map((playerId, index) => 
                // Let the API handle position calculation - only refresh on the last item
                addToQueue(playerId, undefined, index === playerIds.length - 1)
            );
            
            await Promise.allSettled(promises);
            
            // Reset selection state
            setSelectedPlayers(new Set());
            
            // Close the dialog only after everything is complete
            setIsAddPlayerOpen(false);
        } catch (error) {
            console.error('Error adding players to queue:', error);
            setError('Failed to add some players to queue. Please try again.');
        } finally {
            // Reset loading state
            setIsAddingPlayers(false);
        }
    };

    // Add handler for removing player from queue
    const handleRemoveFromQueue = async (queueItemId: string) => {
        try {
            await removeFromQueue(queueItemId, async () => {
                // Refresh the available players list after removing a player from the queue
                await fetchPlayers();
            });
            
            // Refresh the queue
            await fetchQueue();
        } catch (error) {
            console.error('Error removing player from queue:', error);
            setError('Failed to remove player from queue');
        }
    };

    // Replace the randomize queue handler with clear queue handler
    const handleClearQueue = async () => {
        try {
            const result = await fetchWithAuth<ClearQueueResponse>('/api/auction/queue/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    sportCategory,
                }),
            });

            showToast({
                message: result.message || 'Queue cleared successfully',
                type: 'success'
            });

            // Refresh queue and available players after clearing
            await fetchQueue();
            await fetchPlayers();
        } catch (error) {
            console.error('Error clearing queue:', error);
            setError('Failed to clear queue');
            showToast({
                message: 'Failed to clear queue',
                type: 'error'
            });
        }
    };

    const [isQueueExpanded, setIsQueueExpanded] = useState(true);

    // Add a function to handle refresh
    const handleRefresh = () => {
        fetchTeams();
        fetchQueue();
        fetchPlayers();
        showToast({
            message: 'Data refreshed successfully',
            type: 'success'
        });
    };

    if (teamsLoading || queueLoading || playersLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                p: { xs: 2, md: 4 },
                transition: 'all 0.3s ease-in-out'
            }}
        >
            <Box 
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 4,
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <SportsVolleyballIcon 
                    sx={{ 
                        fontSize: 48, 
                        color: 'primary.main',
                        transform: 'rotate(-45deg)',
                        animation: 'bounce 2s infinite ease-in-out'
                    }} 
                />
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, primary.main, primary.dark)',
                        WebkitBackgroundClip: 'text',
                        color: 'primary.main'
                    }}
                >
                    {sportCategory === 'VOLLEYBALL_OPEN_MEN' ? 'Volleyball' : 'Throwball Women'} Auction Management
                </Typography>

                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tabs
                        value={sportCategory}
                        onChange={(_, val) => {
                            setSportCategory(val);
                            setCurrentPlayer(null);
                            setSelectedTeam('');
                            setFinalBid(0);
                            setError('');
                        }}
                        sx={{
                            minHeight: 36,
                            '& .MuiTab-root': { minHeight: 36, py: 0.5, px: 2, fontSize: '0.85rem' },
                            '& .MuiTabs-indicator': {
                                backgroundColor: sportCategory === 'THROWBALL_WOMEN' ? '#e91e63' : undefined,
                            },
                        }}
                    >
                        <Tab
                            value="VOLLEYBALL_OPEN_MEN"
                            icon={<SportsVolleyballIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Volleyball"
                        />
                        <Tab
                            value="THROWBALL_WOMEN"
                            icon={<SportsTennisIcon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            label="Throwball Women"
                            sx={{
                                '&.Mui-selected': { color: '#e91e63' },
                            }}
                        />
                    </Tabs>
                    <Tooltip title="Refresh data">
                        <IconButton 
                            color="primary" 
                            onClick={handleRefresh} 
                            aria-label="refresh data"
                            sx={{ 
                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                '&:hover': {
                                    bgcolor: 'rgba(25, 118, 210, 0.15)',
                                }
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {(teamsError || queueError || playersError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {teamsError || queueError || playersError}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={async () => {
                                try {
                                    // Use isSubmitting as a loading indicator since it's already defined
                                    setIsSubmitting(true);
                                    setError('Running diagnostics...');
                                    
                                    const response = await fetch('/api/diagnostics/supabase');
                                    if (!response.ok) {
                                        throw new Error('Failed to run diagnostics');
                                    }
                                    const diagnosticData = await response.json();
                                    console.log('Diagnostic results:', diagnosticData);
                                    
                                    // Format diagnostic results for display
                                    const isHealthy = diagnosticData.supabaseConnection.isHealthy;
                                    const schemaValid = diagnosticData.databaseSchema.isValid;
                                    const envVarsPresent = Object.values(diagnosticData.environmentVariables).every(Boolean);
                                    
                                    let diagnosticMessage = '';
                                    
                                    if (!envVarsPresent) {
                                        diagnosticMessage = 'Missing environment variables. Please check your .env file.';
                                    } else if (!isHealthy) {
                                        diagnosticMessage = `Database connection error: ${diagnosticData.supabaseConnection.message}`;
                                    } else if (!schemaValid) {
                                        diagnosticMessage = `Database schema issue: ${diagnosticData.databaseSchema.message}`;
                                    } else {
                                        diagnosticMessage = 'Diagnostics completed successfully. Database connection is healthy.';
                                        // If diagnostics are successful, refresh the data
                                        handleRefresh();
                                        setError('');
                                        return;
                                    }
                                    
                                    // Show diagnostic message in the error state
                                    setError(diagnosticMessage);
                                } catch (err) {
                                    console.error('Error running diagnostics:', err);
                                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                                    setError(`Failed to run diagnostics: ${errorMessage}`);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            Diagnose
                        </Button>
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={handleRefresh}
                            disabled={isSubmitting}
                        >
                            Retry
                        </Button>
                        <Button 
                            color="primary" 
                            size="small" 
                            onClick={handleManualRefresh}
                            disabled={isSubmitting}
                        >
                            Refresh Players
                        </Button>
                    </Box>
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Current Player & Bid Recording Section */}
                <Grid item xs={12} md={isQueueExpanded ? 6 : 12}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 4,
                            mb: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(165deg, #ffffff 0%, #f8f9fa 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.002)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '150px',
                                height: '150px',
                                background: 'radial-gradient(circle at top right, rgba(25, 118, 210, 0.08), transparent 70%)',
                                borderRadius: '0 0 0 100%',
                                zIndex: 0
                            }}
                        />
                        
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Box 
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 3
                                }}
                            >
                                <MilitaryTechIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Current Player
                                </Typography>
                            </Box>

                            {currentPlayer ? (
                                <Box>
                                    <Box 
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', md: 'row' },
                                            gap: 4,
                                            mb: 4,
                                            p: 3,
                                            bgcolor: 'background.default',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                    >
                                        {/* Left side - Image and Basic Info */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 2,
                                                minWidth: { md: '220px' }
                                            }}
                                        >
                                            <Avatar
                                                src={currentPlayer.profile_image_url}
                                                alt={currentPlayer.name}
                                                sx={{ 
                                                    width: 200,
                                                    height: 200,
                                                    border: '4px solid',
                                                    borderColor: 'primary.main',
                                                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                                                    transition: 'transform 0.3s ease',
                                                }}
                                            />
                                            
                                            {/* Add Undo Bid button if player is allocated to a team */}
                                            {currentPlayer.current_team_id && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<UndoIcon />}
                                                    onClick={handleUndoBid}
                                                    sx={{
                                                        mt: 1,
                                                        width: '100%',
                                                        borderRadius: 2,
                                                        fontWeight: 600,
                                                        '&:hover': {
                                                            backgroundColor: 'error.light',
                                                            color: 'error.contrastText',
                                                        }
                                                    }}
                                                >
                                                    Undo Allocation
                                                </Button>
                                            )}

                                            <Stack spacing={1} alignItems="center">
                                                <Typography 
                                                    variant="h4" 
                                                    sx={{ 
                                                        fontWeight: 700,
                                                        color: 'text.primary',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {currentPlayer.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip 
                                                        label={`Base Points: ${formatPointsInCrores(currentPlayer.base_price)}`}
                                                        icon={<LeaderboardIcon />}
                                                        sx={{
                                                            ...getBasePointsStyling(),
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </Stack>
                                                {currentPlayer.created_at && (
                                                    <Typography 
                                                        variant="caption" 
                                                        color="text.secondary"
                                                        sx={{ mt: 1 }}
                                                    >
                                                        Registered: {new Date(currentPlayer.created_at).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* Right side - Detailed Info */}
                                        <Box sx={{ flex: 1 }}>
                                            <Grid container spacing={2.5}>
                                                {/* Player Attributes Row */}
                                                <Grid item xs={12}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="subtitle1" 
                                                            color="primary"
                                                            sx={{ 
                                                                mb: 1.5, 
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <PersonIcon fontSize="small" />
                                                            Player Attributes
                                                        </Typography>
                                                        
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Position
                                                                    </Typography>
                                                        <Chip 
                                                            label={ALL_POSITIONS.find(pos => pos.value === currentPlayer.player_position)?.label || 'Unknown'}
                                                            icon={<SportsVolleyballIcon />}
                                                                        size="small"
                                                            sx={getPositionStyling()}
                                                        />
                                                                </Stack>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Skill Level
                                                                    </Typography>
                                                        <Chip 
                                                            label={SKILL_LEVELS.find(level => level.value === currentPlayer.skill_level)?.label || 'Unknown'}
                                                            icon={<StarIcon />}
                                                                        size="small"
                                                            sx={{ 
                                                                ...getSkillLevelStyling(currentPlayer.skill_level)
                                                            }}
                                                        />
                                                    </Stack>
                                                </Grid>

                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Height
                                                                    </Typography>
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {currentPlayer.height ? `${currentPlayer.height} m` : 'N/A'}
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Last Played
                                                                    </Typography>
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {(() => {
                                                                            // Default to "Playing Actively" if no registration data is available
                                                                            if (!currentPlayer.registration_data) {
                                                                                console.log('No registration_data, using default value');
                                                                                return LAST_PLAYED_OPTIONS.find(opt => 
                                                                                    opt.value === 'PLAYING_ACTIVELY'
                                                                                )?.label || 'Playing Actively';
                                                                            }
                                                                            
                                                                            // Try multiple approaches to get the last played date
                                                                            const regData = currentPlayer.registration_data;
                                                                            
                                                                            // Try direct access to known field names
                                                                            const lastPlayedValue = 
                                                                                regData.last_played_date || 
                                                                                regData.last_played ||
                                                                                regData.lastPlayed ||
                                                                                regData.playing_status;
                                                                                
                                                                            // If we found a value, look up its label
                                                                            if (lastPlayedValue) {
                                                                                const option = LAST_PLAYED_OPTIONS.find(opt => 
                                                                                    opt.value === lastPlayedValue
                                                                                );
                                                                                if (option) return option.label;
                                                                                
                                                                                // If the value doesn't match our options but is a string, return it directly
                                                                                if (typeof lastPlayedValue === 'string') return lastPlayedValue;
                                                                            }
                                                                            
                                                                            // Default to "Playing Actively" if no value is found
                                                                            return LAST_PLAYED_OPTIONS.find(opt => 
                                                                                opt.value === 'PLAYING_ACTIVELY'
                                                                            )?.label || 'Playing Actively';
                                                                        })()}
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                            
                                                            {currentPlayer.jersey_number && (
                                                                <Grid item xs={12} sm={6} md={4}>
                                                                    <Stack spacing={0.5}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Jersey Number
                                                                        </Typography>
                                                                        <Typography variant="body1" fontWeight="medium">
                                                                            {currentPlayer.jersey_number}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Grid>
                                                            )}
                                                            
                                                            {currentPlayer.experience && (
                                                                <Grid item xs={12} sm={6} md={4}>
                                                                    <Stack spacing={0.5}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Experience
                                                                        </Typography>
                                                                        <Typography variant="body1" fontWeight="medium">
                                                                            {currentPlayer.experience} years
                                                                        </Typography>
                                                                    </Stack>
                                                                </Grid>
                                                            )}
                                                            
                                                            {currentPlayer.tshirt_size && (
                                                                <Grid item xs={12} sm={6} md={4}>
                                                                    <Stack spacing={0.5}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            T-Shirt Size
                                                                        </Typography>
                                                                        <Typography variant="body1" fontWeight="medium">
                                                                            {currentPlayer.tshirt_size}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>

                                    <Paper 
                                        elevation={3} 
                                        sx={{ 
                                            p: 3, 
                                            mb: 4, 
                                            bgcolor: 'background.paper',
                                            borderRadius: 3,
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
                                            }
                                        }}
                                    >
                                        <Timer
                                            ref={timerRef}
                                            config={timerConfig}
                                            onPhaseChange={handlePhaseChange}
                                            onComplete={handleTimerComplete}
                                        />
                                    </Paper>

                                    <Divider sx={{ my: 4 }} />

                                    {/* Bid Recording Section */}
                                    <Box 
                                        sx={{
                                            p: 3,
                                            bgcolor: 'background.default',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: 'primary.main',
                                                fontWeight: 600
                                            }}
                                        >
                                            <ScoreboardIcon />
                                            Record Final Points
                                        </Typography>
                                        
                                        <FormControl fullWidth sx={{ mb: 3 }}>
                                            <InputLabel>Winning Team</InputLabel>
                                            <Select
                                                value={selectedTeam}
                                                label="Winning Team"
                                                onChange={(e) => setSelectedTeam(e.target.value)}
                                                sx={{ 
                                                    '& .MuiSelect-select': { 
                                                        py: 1.5
                                                    }
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            maxHeight: 400,
                                                            '& .MuiMenuItem-root': {
                                                                py: 1.5
                                                            }
                                                        }
                                                    }
                                                }}
                                                renderValue={(selected) => {
                                                    const team = teams.find(t => t.id === selected);
                                                    if (!team) return "Select Team";
                                                    
                                                    return (
                                                        <Stack direction="row" spacing={1} alignItems="center" width="100%">
                                                            <GroupsIcon fontSize="small" />
                                                            <Stack sx={{ flex: 1 }}>
                                                                <Typography variant="body1" fontWeight="medium">
                                                                    {team.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Owner: {team.owner_name} • Players: {team.current_players || 0}
                                                                </Typography>
                                                            </Stack>
                                                            <Chip 
                                                                label={`${formatPointsInCrores(team.remaining_budget)} points`}
                                                                size="small"
                                                                color="primary"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    bgcolor: 'primary.main',
                                                                    color: 'white'
                                                                }}
                                                                icon={<ScoreboardIcon fontSize="small" sx={{ color: 'white !important' }} />}
                                                            />
                                                        </Stack>
                                                    );
                                                }}
                                            >
                                                {teams.map((team) => (
                                                    <MenuItem 
                                                        key={team.id} 
                                                        value={team.id}
                                                        disabled={team.current_players >= team.max_players}
                                                    >
                                                        <Stack direction="row" spacing={1} alignItems="center" width="100%">
                                                            <GroupsIcon fontSize="small" />
                                                            <Stack sx={{ flex: 1 }}>
                                                                <Typography variant="body1" fontWeight="medium">
                                                                    {team.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Owner: {team.owner_name} • Players: {team.current_players || 0}
                                                                </Typography>
                                                            </Stack>
                                                            <Chip 
                                                                label={`${formatPointsInCrores(team.remaining_budget)} points`}
                                                                size="small"
                                                                color="primary"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    bgcolor: 'primary.main',
                                                                    color: 'white'
                                                                }}
                                                                icon={<ScoreboardIcon fontSize="small" sx={{ color: 'white !important' }} />}
                                                            />
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth sx={{ mb: 3 }}>
                                            <InputLabel>Final Points (in Crores)</InputLabel>
                                            <Select
                                                value={finalBid}
                                                label="Final Points (in Crores)"
                                                onChange={(e) => setFinalBid(Number(e.target.value))}
                                                sx={{ 
                                                    '& .MuiOutlinedInput-root': {
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            '& fieldset': {
                                                                borderColor: 'primary.main',
                                                                borderWidth: 2
                                                            }
                                                        },
                                                        '&.Mui-focused': {
                                                            '& fieldset': {
                                                                borderColor: 'primary.main',
                                                                borderWidth: 2,
                                                                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)'
                                                            }
                                                        }
                                                    }
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 300,
                                                        },
                                                    },
                                                }}
                                                renderValue={(value) => (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <ScoreboardIcon color="action" sx={{ mr: 1 }} />
                                                        <Typography>{value} Cr</Typography>
                                                    </Box>
                                                )}
                                            >
                                                {[...Array(100)].map((_, index) => (
                                                    <MenuItem key={index + 1} value={index + 1}>
                                                        {index + 1} Cr
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={handleRecordBid}
                                            disabled={!selectedTeam || finalBid <= 0 || isSubmitting}
                                            sx={{ 
                                                py: 1.5,
                                                px: 4,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                background: 'linear-gradient(45deg, primary.main, primary.dark)',
                                                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                                },
                                                '&:active': {
                                                    transform: 'translateY(1px)'
                                                }
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                                    Recording...
                                                </>
                                            ) : (
                                                'Record Final Points'
                                            )}
                                        </Button>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="warning"
                                            onClick={handleMarkUnallocated}
                                            disabled={!currentPlayer || isSubmitting}
                                            sx={{ 
                                                mt: 2,
                                                py: 1.5,
                                                px: 4,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'warning.light',
                                                    borderColor: 'warning.main',
                                                    color: 'warning.contrastText',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                                },
                                                '&:active': {
                                                    transform: 'translateY(1px)'
                                                }
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Mark as UNALLOCATED (No Bids)'
                                            )}
                                        </Button>

                                        {error && (
                                            <Alert 
                                                severity="error" 
                                                sx={{ 
                                                    mt: 2,
                                                    borderRadius: 2
                                                }}
                                            >
                                                {error}
                                            </Alert>
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Box 
                                    sx={{
                                        textAlign: 'center',
                                        py: 8,
                                        px: 3,
                                        bgcolor: 'action.hover',
                                        borderRadius: 2,
                                        border: '2px dashed',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <PersonIcon 
                                        sx={{ 
                                            fontSize: 60,
                                            color: 'text.secondary',
                                            mb: 2
                                        }}
                                    />
                                    <Typography 
                                        variant="h6"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        No player selected
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Select a player from the queue to start the auction
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Queue Section */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative' }}>
                        <Fade in={!isQueueExpanded}>
                            <Button
                                variant="contained"
                                onClick={() => setIsQueueExpanded(true)}
                                sx={{
                                    position: 'fixed',
                                    right: 24,
                                    bottom: 24,
                                    zIndex: 1000,
                                    borderRadius: '50%',
                                    width: 64,
                                    height: 64,
                                    minWidth: 64,
                                    boxShadow: 4
                                }}
                            >
                                <SportsVolleyballIcon sx={{ transform: 'rotate(-45deg)' }} />
                            </Button>
                        </Fade>
                        <Collapse 
                            in={isQueueExpanded} 
                            orientation="horizontal"
                            sx={{
                                position: { xs: 'static', md: 'relative' },
                                transformOrigin: 'right'
                            }}
                        >
                            <Paper 
                                elevation={3} 
                                sx={{ 
                                    p: 4,
                                    height: '100%',
                                    position: 'relative',
                                    borderRadius: 3,
                                    background: 'linear-gradient(165deg, #ffffff 0%, #f8f9fa 100%)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
                                    }
                                }}
                            >
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: '2px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <GroupsIcon color="primary" />
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            Player Queue
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteSweepIcon />}
                                            onClick={handleClearQueue}
                                            sx={{ mr: 1 }}
                                        >
                                            Clear Queue
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<AddIcon />}
                                            onClick={() => setIsAddPlayerOpen(true)}
                                        >
                                            Add Players
                                    </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<BugReportIcon />}
                                            onClick={() => {
                                                const unallocatedPlayers = availablePlayers.filter(p => p.status === 'UNALLOCATED');
                                                alert(`UNALLOCATED Players (${unallocatedPlayers.length}):\n\n${
                                                    unallocatedPlayers.length > 0 
                                                        ? unallocatedPlayers.map(p => p.name).join('\n') 
                                                        : 'No unallocated players found'
                                                }`);
                                            }}
                                            sx={{ ml: 1 }}
                                            disabled={isSubmitting}
                                        >
                                            Debug
                                        </Button>
                                        <IconButton
                                            onClick={() => setIsQueueExpanded(false)}
                                            sx={{ 
                                                bgcolor: 'action.hover',
                                                '&:hover': {
                                                    bgcolor: 'action.selected'
                                                }
                                            }}
                                        >
                                            <ExpandMoreIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>

                                <Stack 
                                    direction="row" 
                                    spacing={2} 
                                    mb={3}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'background.default',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Position</InputLabel>
                                        <Select
                                            value={positionFilter}
                                            label="Position"
                                            onChange={(e) => setPositionFilter(e.target.value)}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {activePositions.map(pos => (
                                                <MenuItem key={pos.value} value={pos.value}>{pos.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
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

                                {filteredQueue.length === 0 ? (
                                    <Typography color="text.secondary" align="center">
                                        No players in queue
                                    </Typography>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={filteredQueue.map(item => item.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <List>
                                                {filteredQueue.map((item) => (
                                                    <SortableQueueItem
                                                        key={item.id}
                                                        item={item}
                                                        currentPlayer={currentPlayer}
                                                        onSelectPlayer={handleSelectPlayer}
                                                        onRemoveFromQueue={handleRemoveFromQueue}
                                                    />
                                                ))}
                                            </List>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </Paper>
                        </Collapse>
                    </Box>
                </Grid>
            </Grid>

            {/* Add Players Dialog */}
            <Dialog 
                open={isAddPlayerOpen} 
                onClose={() => {
                    if (!isAddingPlayers) {
                    setIsAddPlayerOpen(false);
                    setSelectedPlayers(new Set());
                    }
                }}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        background: 'linear-gradient(165deg, #ffffff 0%, #f8f9fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    py: 2
                }}>
                    Add Players to Queue
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        
                        <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="category-select-label">Category</InputLabel>
                            <Select
                                labelId="category-select-label"
                                value={categoryFilter}
                                label="Category"
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {playerCategories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {/* Debug Section */}
                    <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Debug Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="body2">
                                    <strong>Total Players:</strong> {availablePlayers.length}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Filtered Players:</strong> {filteredAvailablePlayers.length}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2">
                                    <strong>Status Counts:</strong>
                                </Typography>
                                {Object.entries(
                                    availablePlayers.reduce((acc, player) => {
                                        const status = player.status || 'UNKNOWN';
                                        acc[status] = (acc[status] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>)
                                ).map(([status, count]) => (
                                    <Typography key={status} variant="body2">
                                        {status}: {count}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                    
                    {filteredAvailablePlayers.length === 0 && (
                        <Typography variant="body1" align="center" sx={{ py: 4 }}>
                            No players match the current filters.
                        </Typography>
                    )}
                    {filteredAvailablePlayers.length > 0 && (
                        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox 
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        // Select all filtered players
                                                        const newSelected = new Set(selectedPlayers);
                                                        filteredAvailablePlayers.forEach(player => {
                                                            newSelected.add(player.id);
                                                        });
                                                        setSelectedPlayers(newSelected);
                                                    } else {
                                                        // Deselect all filtered players
                                                        const newSelected = new Set(selectedPlayers);
                                                        filteredAvailablePlayers.forEach(player => {
                                                            newSelected.delete(player.id);
                                                        });
                                                        setSelectedPlayers(newSelected);
                                                    }
                                                }}
                                                checked={
                                                    filteredAvailablePlayers.length > 0 &&
                                                    filteredAvailablePlayers.every(player => selectedPlayers.has(player.id))
                                                }
                                                indeterminate={
                                                    filteredAvailablePlayers.some(player => selectedPlayers.has(player.id)) &&
                                                    !filteredAvailablePlayers.every(player => selectedPlayers.has(player.id))
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Skill Level</TableCell>
                                        <TableCell>Base Price</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Category</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAvailablePlayers.map((player) => (
                                        <TableRow 
                                        key={player.id}
                                            hover
                                            onClick={() => {
                                                const newSelected = new Set(selectedPlayers);
                                                if (selectedPlayers.has(player.id)) {
                                                    newSelected.delete(player.id);
                                                } else {
                                                    newSelected.add(player.id);
                                                }
                                                setSelectedPlayers(newSelected);
                                            }}
                                        sx={{
                                                cursor: 'pointer',
                                                '&.Mui-selected': {
                                                    backgroundColor: 'action.selected'
                                                }
                                            }}
                                            selected={selectedPlayers.has(player.id)}
                                        >
                                            <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedPlayers.has(player.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                const newSelected = new Set(selectedPlayers);
                                                if (e.target.checked) {
                                                    newSelected.add(player.id);
                                                } else {
                                                    newSelected.delete(player.id);
                                                }
                                                setSelectedPlayers(newSelected);
                                            }}
                                        />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar 
                                                        src={player.profile_image_url} 
                                                        alt={player.name || 'Unknown'}
                                                        sx={{ width: 32, height: 32 }}
                                                    >
                                                        {player.name ? player.name.charAt(0) : '?'}
                                                    </Avatar>
                                                    <Typography variant="body2">{player.name || 'Unknown'}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {ALL_POSITIONS.find(pos => pos.value === player.player_position)?.label || 'Unknown'}
                                            </TableCell>
                                            <TableCell>
                                                    <Chip 
                                                    label={SKILL_LEVELS.find(level => level.value === player.skill_level)?.label || 'Unknown'}
                                                        size="small"
                                                    sx={getSkillLevelStyling(player.skill_level)}
                                                />
                                            </TableCell>
                                            <TableCell>{formatPointsInCrores(player.base_price)}</TableCell>
                                            <TableCell>
                                                    <Chip 
                                                    label={player.status}
                                                        size="small"
                                                    color={player.status === 'AVAILABLE' || player.status === 'UNALLOCATED' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {playerCategories.find(cat => cat.id === player.category_id)?.name || 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                        setIsAddPlayerOpen(false);
                        setSelectedPlayers(new Set());
                        }}
                        disabled={isAddingPlayers}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBulkAddToQueue}
                        variant="contained"
                        disabled={selectedPlayers.size === 0 || isAddingPlayers}
                    >
                        {isAddingPlayers ? 'Adding...' : `Add Selected (${selectedPlayers.size})`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add keyframes for animations */}
            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: rotate(-45deg) translateY(0); }
                    50% { transform: rotate(-45deg) translateY(-10px); }
                }
            `}</style>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Auction Control
                </Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => setIsAddPlayerOpen(true)}
                        startIcon={<AddIcon />}
                        sx={{ mr: 1 }}
                    >
                        Add Players
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={() => {
                            const unallocatedPlayers = availablePlayers.filter(p => p.status === 'UNALLOCATED');
                            alert(`UNALLOCATED Players (${unallocatedPlayers.length}):\n\n${
                                unallocatedPlayers.length > 0 
                                    ? unallocatedPlayers.map(p => p.name).join('\n') 
                                    : 'No unallocated players found'
                            }`);
                        }}
                        startIcon={<BugReportIcon />}
                        sx={{ ml: 1 }}
                        disabled={isSubmitting}
                    >
                        Debug
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

// Wrap the default export with ToastProvider
export default function AuctionControlWrapper({ params }: AuctionControlProps) {
    return (
        <ToastProvider>
            <AuctionControl params={params} />
        </ToastProvider>
    );
} 