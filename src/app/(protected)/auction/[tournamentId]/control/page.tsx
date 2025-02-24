'use client';

import { useState, useRef } from 'react';
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
    Fade
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
import { PlayerProfile, QueueItemWithPlayer } from '@/types/auction';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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

interface AuctionControlProps {
    params: {
        tournamentId: string;
    };
}

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
function SortableQueueItem({ item, currentPlayer, onSelectPlayer }: { 
    item: QueueItemWithPlayer; 
    currentPlayer: PlayerProfile | null;
    onSelectPlayer: (player: PlayerProfile) => void;
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
                            label={`Base Points: ${item.player.base_price}`}
                            size="small"
                            icon={<LeaderboardIcon fontSize="small" />}
                            sx={getBasePointsStyling('small')}
                        />
                        <Chip 
                            label={POSITIONS.find(pos => pos.value === item.player.player_position)?.label}
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
                <IconButton 
                    edge="end" 
                    onClick={() => onSelectPlayer(item.player)}
                    disabled={currentPlayer?.id === item.player.id}
                >
                    {currentPlayer?.id === item.player.id ? (
                        <PersonIcon color="primary" />
                    ) : (
                        <ArrowForwardIcon />
                    )}
                </IconButton>
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

export default function AuctionControl({ params: { tournamentId } }: AuctionControlProps) {
    // State management
    const [finalBid, setFinalBid] = useState<number>(0);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
    
    // Queue management state
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const [positionFilter, setPositionFilter] = useState<string>('');
    const [skillFilter, setSkillFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);

    // Add state for selected players in bulk selection
    const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
    
    // Add sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Add timer ref
    const timerRef = useRef<TimerHandle>(null);

    // Fetch teams and queue data
    const { teams, isLoading: teamsLoading, error: teamsError } = useTeams({ tournamentId });
    const { 
        queue, 
        isLoading: queueLoading, 
        error: queueError,
        markAsProcessed,
        fetchQueue,
        addToQueue
    } = useAuctionQueue({ tournamentId, enablePolling: false });
    const {
        players: availablePlayers,
        isLoading: playersLoading,
        error: playersError
    } = useAvailablePlayers({ tournamentId });

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

        if (amount > team.remaining_points) {
            return `Bid exceeds team's remaining points (${team.remaining_points})`;
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
            const response = await fetch('/api/auction/bid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    playerId: currentPlayer.id,
                    teamId: selectedTeam,
                    amount: finalBid,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to record bid');
                return;
            }

            // Mark current queue item as processed
            const queueItem = queue.find(item => item.player.id === currentPlayer.id);
            if (queueItem) {
                await markAsProcessed(queueItem.id);
                await fetchQueue(); // Refresh queue
            }

            // Reset form after successful recording
            setFinalBid(0);
            setSelectedTeam('');
            setError('');
            setCurrentPlayer(null); // Clear current player
        } catch (error) {
            console.error('Error recording bid:', error);
            setError('Failed to record bid');
        }
    };

    const handleSelectPlayer = (player: PlayerProfile) => {
        setCurrentPlayer(player);
        setFinalBid(0);
        setSelectedTeam('');
        setError('');
    };

    const handleAddToQueue = async (player: PlayerProfile) => {
        try {
            await addToQueue(player.id);
            setIsAddPlayerOpen(false);
        } catch (error) {
            console.error('Error adding player to queue:', error);
            setError('Failed to add player to queue');
        }
    };

    const filteredQueue = queue
        .filter(item => !item.is_processed)
        .filter(item => !positionFilter || item.player.player_position === positionFilter)
        .filter(item => !skillFilter || item.player.skill_level === skillFilter);

    const filteredAvailablePlayers = availablePlayers
        .filter(player => !queue.some(item => item.player_id === player.id))
        .filter(player => !positionFilter || player.player_position === positionFilter)
        .filter(player => !skillFilter || player.skill_level === skillFilter)
        .filter(player => 
            !searchQuery || 
            player.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                await fetch('/api/auction/queue/reorder', {
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
            const playerIds = Array.from(selectedPlayers);
            await Promise.all(playerIds.map(id => addToQueue(id)));
            setSelectedPlayers(new Set());
            setIsAddPlayerOpen(false);
        } catch (error) {
            console.error('Error adding players to queue:', error);
            setError('Failed to add players to queue');
        }
    };

    const [isQueueExpanded, setIsQueueExpanded] = useState(true);

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
                    Volleyball Auction Management
                </Typography>
            </Box>

            {(teamsError || queueError || playersError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {teamsError || queueError || playersError}
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
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {/* Left side - Image and Basic Info */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 2,
                                                minWidth: { md: '200px' }
                                            }}
                                        >
                                            <Avatar
                                                src={currentPlayer.profile_image_url}
                                                alt={currentPlayer.name}
                                                sx={{ 
                                                    width: 180,
                                                    height: 180,
                                                    border: '4px solid',
                                                    borderColor: 'primary.main',
                                                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            />
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
                                            <Grid container spacing={2}>
                                                {/* Points and Position Row */}
                                                <Grid item xs={12}>
                                                    <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                                                        <Chip 
                                                            label={`Base Points: ${currentPlayer.base_price}`}
                                                            icon={<LeaderboardIcon />}
                                                            sx={getBasePointsStyling()}
                                                        />
                                                        <Chip 
                                                            label={POSITIONS.find(pos => pos.value === currentPlayer.player_position)?.label || 'Unknown'}
                                                            icon={<SportsVolleyballIcon />}
                                                            sx={getPositionStyling()}
                                                        />
                                                        <Chip 
                                                            label={SKILL_LEVELS.find(level => level.value === currentPlayer.skill_level)?.label || 'Unknown'}
                                                            icon={<StarIcon />}
                                                            sx={{ 
                                                                height: 32,
                                                                fontWeight: 600,
                                                                ...getSkillLevelStyling(currentPlayer.skill_level)
                                                            }}
                                                        />
                                                    </Stack>
                                                </Grid>

                                                {/* Personal Details */}
                                                <Grid item xs={12} sm={6}>
                                                    <Paper 
                                                        sx={{ 
                                                            p: 2,
                                                            height: '100%',
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            color="primary"
                                                            sx={{ mb: 1, fontWeight: 600 }}
                                                        >
                                                            Personal Details
                                                        </Typography>
                                                        <Stack spacing={1}>
                                                            <Typography variant="body2">
                                                                Height: <strong>{currentPlayer.height || 'N/A'}</strong> {currentPlayer.height ? 'cm' : ''}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Last Played: <strong>{LAST_PLAYED_OPTIONS.find(opt => opt.value === currentPlayer.registration_data?.last_played_date)?.label || 'N/A'}</strong>
                                                            </Typography>
                                                        </Stack>
                                                    </Paper>
                                                </Grid>

                                                {/* Tournament History */}
                                                <Grid item xs={12} sm={6}>
                                                    <Paper 
                                                        sx={{ 
                                                            p: 2,
                                                            height: '100%',
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            color="primary"
                                                            sx={{ 
                                                                mb: 1,
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <EmojiEventsIcon fontSize="small" />
                                                            Tournament History
                                                        </Typography>
                                                        {currentPlayer.tournament_history && currentPlayer.tournament_history.length > 0 ? (
                                                            <Stack spacing={2}>
                                                                {currentPlayer.tournament_history.map((history, index) => (
                                                                    <Box 
                                                                        key={index}
                                                                        sx={{
                                                                            p: 1.5,
                                                                            bgcolor: 'action.hover',
                                                                            borderRadius: 1,
                                                                        }}
                                                                    >
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                            {history.name} ({history.year})
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Role: {history.role}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Stack>
                                                        ) : (
                                                            <Typography 
                                                                variant="body2" 
                                                                color="text.secondary"
                                                                sx={{ 
                                                                    textAlign: 'center',
                                                                    py: 2
                                                                }}
                                                            >
                                                                No tournament history available
                                                            </Typography>
                                                        )}
                                                    </Paper>
                                                </Grid>

                                                {/* Achievements Section */}
                                                {currentPlayer.achievements && currentPlayer.achievements.length > 0 && (
                                                    <Grid item xs={12}>
                                                        <Paper 
                                                            sx={{ 
                                                                p: 2,
                                                                bgcolor: 'background.paper',
                                                                borderRadius: 2,
                                                                border: '1px solid',
                                                                borderColor: 'divider'
                                                            }}
                                                        >
                                                            <Typography 
                                                                variant="subtitle2" 
                                                                color="primary"
                                                                sx={{ mb: 1, fontWeight: 600 }}
                                                            >
                                                                Achievements
                                                            </Typography>
                                                            <Stack spacing={1}>
                                                                {currentPlayer.achievements.map((achievement, index) => (
                                                                    <Box 
                                                                        key={index}
                                                                        sx={{
                                                                            p: 1.5,
                                                                            bgcolor: 'action.hover',
                                                                            borderRadius: 1
                                                                        }}
                                                                    >
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                            {achievement.title} ({achievement.year})
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {achievement.description}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Stack>
                                                        </Paper>
                                                    </Grid>
                                                )}
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
                                            config={DEFAULT_CONFIG}
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
                                            >
                                                {teams.map((team) => (
                                                    <MenuItem 
                                                        key={team.id} 
                                                        value={team.id}
                                                        disabled={team.current_players >= team.max_players}
                                                    >
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <GroupsIcon fontSize="small" />
                                                            <Typography>
                                                                {team.name}
                                                            </Typography>
                                                            <Chip 
                                                                label={`${team.remaining_points} points`}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                icon={<ScoreboardIcon fontSize="small" />}
                                                            />
                                                        </Stack>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {selectedTeam && (
                                            <Box 
                                                mb={3}
                                                p={2}
                                                bgcolor="action.hover"
                                                borderRadius={1}
                                            >
                                                {teams.find(t => t.id === selectedTeam) && (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <GroupsIcon fontSize="small" color="action" />
                                                        <Typography color="text.secondary">
                                                            Team Capacity: <strong>{teams.find(t => t.id === selectedTeam)?.current_players}/{teams.find(t => t.id === selectedTeam)?.max_players}</strong> players
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Box>
                                        )}

                                        <TextField
                                            fullWidth
                                            label="Final Points"
                                            type="number"
                                            value={finalBid}
                                            onChange={(e) => setFinalBid(Number(e.target.value))}
                                            sx={{ 
                                                mb: 3,
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
                                            InputProps={{
                                                startAdornment: <ScoreboardIcon color="action" sx={{ mr: 1 }} />
                                            }}
                                        />

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={handleRecordBid}
                                            disabled={!selectedTeam || finalBid <= 0}
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
                                            Record Final Points
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
                                            startIcon={<AddIcon />}
                                            variant="contained"
                                            onClick={() => setIsAddPlayerOpen(true)}
                                            sx={{ 
                                                bgcolor: 'primary.main',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark'
                                                }
                                            }}
                                        >
                                            Add Players
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
                                            {POSITIONS.map(pos => (
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
                    setIsAddPlayerOpen(false);
                    setSelectedPlayers(new Set());
                }}
                maxWidth="md"
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
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs 
                            value={selectedTab} 
                            onChange={(_, newValue) => setSelectedTab(newValue)}
                        >
                            <Tab label="All Players" />
                            {POSITIONS.map((pos, index) => (
                                <Tab key={pos.value} label={pos.label} />
                            ))}
                        </Tabs>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <TextField
                            label="Search Players"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flexGrow: 1, mr: 2 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleBulkAddToQueue}
                            disabled={selectedPlayers.size === 0}
                        >
                            Add Selected ({selectedPlayers.size})
                        </Button>
                    </Box>

                    <List>
                        {filteredAvailablePlayers
                            .filter(player => selectedTab === 0 || player.player_position === POSITIONS[selectedTab - 1].value)
                            .map((player) => (
                                <ListItem
                                    key={player.id}
                                    sx={{
                                        mb: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedPlayers.has(player.id)}
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
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography>{player.name}</Typography>
                                                <Chip 
                                                    label={POSITIONS.find(pos => pos.value === player.player_position)?.label || 'Unknown'}
                                                    size="small"
                                                    icon={<SportsVolleyballIcon fontSize="small" />}
                                                    sx={getPositionStyling('small')}
                                                />
                                            </Stack>
                                        }
                                        secondary={
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                <Chip 
                                                    label={`Base Points: ${player.base_price}`}
                                                    size="small"
                                                    icon={<LeaderboardIcon fontSize="small" />}
                                                    sx={getBasePointsStyling('small')}
                                                />
                                                <Chip 
                                                    label={SKILL_LEVELS.find(level => level.value === player.skill_level)?.label || 'Unknown'}
                                                    size="small"
                                                    icon={<StarIcon fontSize="small" />}
                                                    sx={getSkillLevelStyling(player.skill_level)}
                                                />
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                            ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setIsAddPlayerOpen(false);
                        setSelectedPlayers(new Set());
                    }}>
                        Close
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
        </Box>
    );
} 