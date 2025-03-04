import { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Paper,
    Tab,
    Tabs,
    Stack,
    Alert,
    AlertTitle,
    Snackbar,
    Typography,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { CurrentSquadTable } from './CurrentSquadTable';
import { PreferredPlayersTable } from './PreferredPlayersTable';
import { TeamBudget } from './TeamBudget';
import { FilterBar } from '../shared/FilterBar';
import { EditPreferenceDialog } from '../dialogs/EditPreferenceDialog';
import { AddPreferredPlayer } from '../dialogs/AddPreferredPlayer';
import { SimulationSummary } from '../simulation/SimulationSummary';
import { TeamCompositionStatus } from './TeamCompositionStatus';
import { calculateTeamCompositionStatus } from '../../utils/team-composition';

import { useTeamData } from '../../hooks/useTeamData';
import { usePlayerPreferences } from '../../hooks/usePlayerPreferences';
import { useFiltersAndSort } from '../../hooks/useFiltersAndSort';
import { useTeamSimulation } from '../../hooks/useTeamSimulation';
import { DASHBOARD_TABS } from '../../constants';
import type { PlayerWithPreference } from '../../types/player';
import type { TeamData } from '../../types/team';
import type { TeamBudgetDetails, TeamBudgetMetrics } from '../../types/budget';
import type { PlayerWithCategory } from '../../utils/team-composition';

interface TeamManagementDashboardProps {
    teamId: string;
}

// Helper function to check if a user is a full admin
const isFullAdmin = (email?: string): boolean => {
    // Define known admin emails (these will have full admin access)
    const adminEmails = [
        'gk@pbel.in', // Super admin
        'admin@pbel.in',  // Admin
        'amit@pbel.in',   // Admin
        'vasu@pbel.in'    // Admin
    ]; // Add all admin emails here
    return email ? adminEmails.includes(email) : false;
}

// Define explicit list of team owner emails
const teamOwnerEmails = [
    'naveen@pbel.in',
    'anish@pbel.in',
    'subhamitra@pbel.in',
    'raju@pbel.in',
    'saravana@pbel.in',
    'praveenraj@pbel.in',
    'romesh@pbel.in',
    'srinivas@pbel.in',
    'sraveen@pbel.in'
];

// Helper function to check if a user is a team owner
const isTeamOwner = (email?: string): boolean => {
    return email ? teamOwnerEmails.includes(email) : false;
}

export function TeamManagementDashboard({ teamId }: TeamManagementDashboardProps) {
    const supabase = createClientComponentClient();

    // State management hooks
    const { 
        loading, 
        error, 
        teamData, 
        budgetDetails: rawBudgetDetails,
        budgetMetrics: rawBudgetMetrics,
        refreshTeamData 
    } = useTeamData(teamId);

    // Add initial data logging
    console.log('Raw team data received:', {
        hasPlayers: Boolean(teamData?.players),
        playerCount: teamData?.players?.length,
        samplePlayer: teamData?.players?.[0] ? {
            id: teamData.players[0].player.id,
            name: teamData.players[0].player.name,
            rawPhoneNumber: teamData.players[0].player.phone_number,
            phoneNumberType: typeof teamData.players[0].player.phone_number
        } : null
    });

    // Convert null to undefined for type compatibility
    const budgetDetails = useMemo(() => {
        if (!rawBudgetDetails) return undefined;
        
        return {
            ...rawBudgetDetails,
            budget_utilization_percentage: rawBudgetDetails.budget_utilization_percentage ?? 
                ((rawBudgetDetails.initial_budget - rawBudgetDetails.remaining_budget) / rawBudgetDetails.initial_budget) * 100
        };
    }, [rawBudgetDetails]);
    
    const budgetMetrics = rawBudgetMetrics || undefined;

    const {
        selectedPlayers,
        handlePlayerSelection,
        handleMaxBidChange,
        handleAddSelectedPlayers,
        handlePreferenceEdit,
        handlePreferenceUpdate,
        handleRemovePreference,
        editingPreference,
        setEditingPreference,
        error: preferencesError,
        deleteConfirmation,
        handleDeleteClick,
        handleDeleteCancel,
        handleDeleteConfirm
    } = usePlayerPreferences(teamId, refreshTeamData);

    const {
        filterState,
        sortState,
        setFilterState,
        setSortState,
        handleClearFilters,
        filterPlayers,
        sortPlayers
    } = useFiltersAndSort();

    // Calculate team composition status
    const teamCompositionAnalysis = useMemo(() => {
        if (!teamData?.players) return null;
        
        // Log raw data
        console.log('Raw team data:', {
            players: teamData.players,
            availablePlayers: teamData.available_players?.filter(p => p.is_preferred)
        });
        
        // Map current squad players to the correct format
        const currentSquadPlayers = teamData.players.map(p => {
            // Enhanced debug logging for raw player data
            console.log('Raw player data in mapping:', {
                id: p.player.id,
                name: p.player.name,
                rawPhoneNumber: p.player.phone_number,
                phoneNumberType: typeof p.player.phone_number,
                fullPlayerData: JSON.stringify(p.player)
            });

            const player: PlayerWithCategory = {
                id: p.player.id,
                name: p.player.name,
                player_position: p.player.player_position,
                skill_level: p.player.skill_level,
                base_price: p.player.base_price,
                profile_image_url: p.player.profile_image_url,
                phone_number: p.player.phone_number,
                status: p.player.status,
                category: p.player.category || null
            };

            // Log the mapped player with detailed phone number info
            console.log('Mapped player data:', {
                id: player.id,
                name: player.name,
                mappedPhoneNumber: player.phone_number,
                phoneNumberType: typeof player.phone_number,
                isNull: player.phone_number === null,
                isUndefined: player.phone_number === undefined
            });

            return player;
        });

        // Log the final mapped data
        console.log('Final mapped current squad players:', currentSquadPlayers.map(p => ({
            id: p.id,
            name: p.name,
            phoneNumber: p.phone_number,
            phoneNumberType: typeof p.phone_number,
            isNull: p.phone_number === null,
            isUndefined: p.phone_number === undefined,
            stringified: JSON.stringify(p.phone_number)
        })));

        // Map preferred players to the correct format
        const allPreferredPlayers = (teamData.available_players || [])
            .filter(p => p.is_preferred);
        
        console.log('All preferred players before filtering:', allPreferredPlayers.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category?.category_type,
            is_preferred: p.is_preferred,
            raw_is_preferred: JSON.stringify(p.is_preferred)
        })));

        const preferredPlayersNotInSquad = allPreferredPlayers
            .filter(p => !currentSquadPlayers.some(cp => cp.id === p.id))
            .map(p => {
                // Extract preference data if available
                const preferenceData = Array.isArray(p.is_preferred) && p.is_preferred.length > 0 
                    ? p.is_preferred[0] 
                    : null;
                
                // Log individual player mapping for debugging
                console.log('Mapping preferred player:', {
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    is_preferred: p.is_preferred,
                    raw_is_preferred: JSON.stringify(p.is_preferred),
                    preferenceData: preferenceData,
                    preference: preferenceData ? {
                        max_bid: preferenceData.max_bid,
                        notes: preferenceData.notes
                    } : undefined
                });
                
                const player: PlayerWithCategory = {
                    id: p.id,
                    name: p.name,
                    player_position: p.player_position,
                    skill_level: p.skill_level,
                    base_price: p.base_price,
                    profile_image_url: p.profile_image_url,
                    phone_number: p.phone_number,
                    status: p.status,
                    category: p.category || null, // Ensure category is never undefined
                    preference: preferenceData ? {
                        max_bid: preferenceData.max_bid,
                        notes: preferenceData.notes
                    } : undefined
                };
                return player;
            });

        console.log('Mapped preferred players not in squad:', {
            total: preferredPlayersNotInSquad.length,
            players: preferredPlayersNotInSquad.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category?.category_type,
                preference: p.preference
            }))
        });

        return calculateTeamCompositionStatus(
            currentSquadPlayers,
            preferredPlayersNotInSquad,
            teamData.min_players,
            teamData.max_players
        );
    }, [teamData?.players, teamData?.available_players, teamData?.min_players, teamData?.max_players]);

    // Map players for the current squad table and simulation
    const mappedSquadPlayers = useMemo(() => {
        // Log raw team data first
        console.log('Raw team data for squad mapping:', {
            players: teamData?.players.map(p => ({
                name: p.player.name,
                rawPhone: p.player.phone_number,
                fullPlayer: p.player
            }))
        });

        // Use a Map to deduplicate players by ID
        const playerMap = new Map();
        
        // Process each player and keep only the latest entry for each player ID
        teamData?.players.forEach(p => {
            // Skip if player data is missing
            if (!p.player || !p.player.id) return;
            
            // Log the raw phone number for debugging
            console.log('Processing player for squad:', {
                name: p.player.name,
                rawPhone: p.player.phone_number,
                phoneType: typeof p.player.phone_number,
                playerData: JSON.stringify(p.player, null, 2)
            });
            
            const mappedPlayer: PlayerWithCategory & { final_bid_points?: number; is_preferred: boolean } = {
                id: p.player.id,
                name: p.player.name,
                player_position: p.player.player_position,
                skill_level: p.player.skill_level,
                base_price: p.player.base_price,
                profile_image_url: p.player.profile_image_url,
                phone_number: p.player.phone_number || null,  // Ensure null if undefined
                status: p.player.status,
                category: p.player.category || null,
                is_preferred: false,
                final_bid_points: p.final_points,
                preference: undefined
            };

            // Log the mapped player for debugging
            console.log('Mapped squad player:', {
                name: mappedPlayer.name,
                phone: mappedPlayer.phone_number,
                phoneType: typeof mappedPlayer.phone_number
            });

            playerMap.set(p.player.id, mappedPlayer);
        });
        
        // Convert Map to array
        const mappedPlayers = Array.from(playerMap.values());
        
        // Log the final mapped players for debugging
        console.log('Final mapped squad players:', mappedPlayers.map(p => ({
            name: p.name,
            phone: p.phone_number,
            phoneType: typeof p.phone_number
        })));
        
        return mappedPlayers;
    }, [teamData?.players]);

    // Filter available players to get preferred players
    const preferredPlayers = useMemo(() => {
        return (teamData?.available_players || [])
            .filter(p => p.is_preferred)
            .map(p => ({
                ...p,
                category: p.category || null // Ensure category is never undefined
            })) as PlayerWithCategory[];
    }, [teamData?.available_players]);

    // Filter available players to get non-preferred players
    const availablePlayers = useMemo(() => {
        return (teamData?.available_players || [])
            .filter(p => !p.is_preferred)
            .map(p => ({
                ...p,
                category: p.category || null // Ensure category is never undefined
            })) as PlayerWithCategory[];
    }, [teamData?.available_players]);

    // Create a memoized default budget object
    const defaultBudget = useMemo<TeamBudgetDetails>(() => ({
        initial_budget: 0,
        remaining_budget: 0,
        allocated_budget: 0,
        budget_utilization_percentage: 0
    }), []);

    // Update the simulation props with the mapped players
    const simulationProps = useMemo(() => {
        return {
            isPreAuction: true,
            allocatedPlayers: mappedSquadPlayers,
            preferredPlayers: teamData?.available_players?.filter(p => p.is_preferred) || [],
            categoryRequirements: teamData?.categoryRequirements || [],
            teamBudget: budgetDetails || defaultBudget,
            maxPlayers: teamData?.max_players || 0
        };
    }, [teamData, budgetDetails, mappedSquadPlayers, defaultBudget]);

    // Simulation state
    const {
        simulationState,
        validateSimulation
    } = useTeamSimulation(simulationProps);

    // Local state
    const [selectedTab, setSelectedTab] = useState(0);
    const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error';
        open: boolean;
    }>({ message: '', severity: 'success', open: false });

    // Check if user is admin
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const userEmail = session?.user?.email;
            setIsAdmin(isFullAdmin(userEmail));
        };
        
        checkUserRole();
    }, [supabase]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    Loading...
                </Paper>
            </Box>
        );
    }

    if (error || !teamData) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3 }}>
                    Error: {error || 'Failed to load team data'}
                </Paper>
            </Box>
        );
    }

    // Apply filters and sorting only to non-preferred available players
    const filteredPlayers = sortPlayers(filterPlayers(availablePlayers));

    console.log('TeamManagementDashboard - Filtered players count:', filteredPlayers.length);

    // Get simulation validation results
    const validationResult = validateSimulation();

    const handleAddPreferredPlayers = async (selectedPlayers: { player_id: string; max_bid: number }[]) => {
        try {
            console.log('Adding preferred players:', selectedPlayers);
            
            if (!selectedPlayers || selectedPlayers.length === 0) {
                console.warn('No players selected for adding to preferences');
                setNotification({
                    message: 'Please select at least one player to add',
                    severity: 'error',
                    open: true
                });
                return;
            }

            // Refresh the session first
            const { data: { session }, error: refreshError } = await supabase.auth.getSession();
            
            if (refreshError) {
                console.error('Session refresh error:', refreshError);
                setNotification({
                    message: 'Your session has expired. Please log in again.',
                    severity: 'error',
                    open: true
                });
                return;
            }

            if (!session) {
                setNotification({
                    message: 'Please log in to continue.',
                    severity: 'error',
                    open: true
                });
                return;
            }

            // Use the isAdmin state variable instead of checking email domain
            if (!isAdmin) {
                // Only verify team ownership if not admin
                const { data: teamOwners, error: teamError } = await supabase
                    .from('teams')
                    .select(`
                        id,
                        team_owners (
                            auth_user_id
                        )
                    `)
                    .eq('id', teamId)
                    .single();

                if (teamError) {
                    console.error('Team error:', teamError);
                    setNotification({
                        message: 'Error verifying team ownership',
                        severity: 'error',
                        open: true
                    });
                    return;
                }

                if (!teamOwners) {
                    setNotification({
                        message: 'Team not found',
                        severity: 'error',
                        open: true
                    });
                    return;
                }

                const teamOwner = teamOwners.team_owners as { auth_user_id: string }[];
                if (!teamOwner.some(owner => owner.auth_user_id === session.user.id)) {
                    setNotification({
                        message: 'You are not authorized to modify this team\'s preferences',
                        severity: 'error',
                        open: true
                    });
                    return;
                }
            }

            // Prepare the request payload
            const player_ids = selectedPlayers.map(p => p.player_id);
            const max_bids = selectedPlayers.map(p => p.max_bid);
            
            console.log('Making API request with:', { player_ids, max_bids });
            
            const response = await fetch(`/api/teams/${teamId}/preferred-players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_ids,
                    max_bids
                }),
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (!response.ok) {
                const errorMessage = data.error || 'Failed to add selected players';
                if (response.status === 403) {
                    throw new Error('You do not have permission to modify this team\'s preferences');
                } else if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                } else {
                    throw new Error(errorMessage);
                }
            }

            await refreshTeamData();
            setNotification({
                message: 'Players added to preferences successfully',
                severity: 'success',
                open: true
            });
            setIsAddPlayerDialogOpen(false);
        } catch (error) {
            console.error('Error adding preferred players:', error);
            setNotification({
                message: error instanceof Error ? error.message : 'Failed to add selected players',
                severity: 'error',
                open: true
            });
        }
    };

    return (
        <div className="space-y-6">
            <Grid container spacing={4}>
                {/* Team Name Header */}
                <Grid item xs={12}>
                    <Paper 
                        elevation={3}
                        sx={{ 
                            p: 3, 
                            background: 'linear-gradient(45deg, primary.dark 30%, primary.main 90%)',
                            color: 'primary.contrastText',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}25`
                        }}
                    >
                        <GroupsIcon sx={{ fontSize: 32 }} />
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                            {teamData.name || 'Team Management'}
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                            <Tooltip title="Refresh team data">
                                <IconButton 
                                    onClick={refreshTeamData} 
                                    color="inherit"
                                    aria-label="refresh data"
                                    sx={{ 
                                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.25)',
                                        }
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                </Grid>

                {/* Budget Overview */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        height: '100%',
                        '& > *': { 
                            height: '100%',
                            borderRadius: 2,
                            boxShadow: (theme) => `0 8px 32px ${theme.palette.grey[200]}`,
                            background: (theme) => `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        }
                    }}>
                        <TeamBudget
                            teamId={teamId}
                            budget={budgetDetails}
                            metrics={budgetMetrics}
                            isLoading={loading}
                        />
                    </Box>
                </Grid>

                {/* Team Composition Status */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        height: '100%',
                        '& > *': { 
                            height: '100%',
                            borderRadius: 2,
                            boxShadow: (theme) => `0 8px 32px ${theme.palette.grey[200]}`,
                            background: (theme) => `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        }
                    }}>
                        {teamCompositionAnalysis && (
                            <TeamCompositionStatus 
                                analysis={teamCompositionAnalysis} 
                                playerCounts={teamData?.player_counts}
                            />
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Paper 
                        elevation={2}
                        sx={{ 
                            borderRadius: 2,
                            overflow: 'hidden',
                            background: (theme) => `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                            boxShadow: (theme) => `0 8px 32px ${theme.palette.grey[200]}`,
                        }}
                    >
                        <Tabs
                            value={selectedTab}
                            onChange={(_, newValue) => setSelectedTab(newValue)}
                            sx={{ 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                background: (theme) => theme.palette.grey[50],
                                '& .MuiTab-root': {
                                    py: 2,
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                },
                                '& .Mui-selected': {
                                    color: 'primary.main',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            <Tab 
                                icon={<GroupsIcon />} 
                                label="Current Squad"
                                sx={{ gap: 1 }}
                            />
                            <Tab 
                                icon={<StarOutlineIcon />} 
                                label="Preferred Players"
                                sx={{ gap: 1 }}
                            />
                        </Tabs>

                        <Box sx={{ p: 4 }}>
                            {selectedTab === 0 && (
                                <>
                                    <FilterBar
                                        filterState={filterState}
                                        onFilterChange={setFilterState}
                                        onClearFilters={handleClearFilters}
                                        title="Filter Squad"
                                        showCategoryFilter={true}
                                    />
                                    <Box sx={{ mt: 2 }}>
                                        <CurrentSquadTable
                                            players={sortPlayers(filterPlayers(mappedSquadPlayers))}
                                            isLoading={loading}
                                        />
                                    </Box>
                                </>
                            )}

                            {selectedTab === 1 && (
                                <>
                                    {/* Simulation Summary */}
                                    <SimulationSummary
                                        simulation={simulationState}
                                        isPreAuction={true}
                                    />

                                    {/* Validation Alerts */}
                                    {!validationResult.isValid && (
                                        <Stack spacing={2} sx={{ mt: 3, mb: 4 }}>
                                            {validationResult.errors.map((error: string, index: number) => (
                                                <Alert 
                                                    key={index} 
                                                    severity="error"
                                                    sx={{
                                                        borderRadius: 2,
                                                        boxShadow: (theme) => `0 4px 12px ${theme.palette.error.light}25`,
                                                        '& .MuiAlert-icon': {
                                                            color: 'error.main'
                                                        }
                                                    }}
                                                >
                                                    <AlertTitle sx={{ fontWeight: 600 }}>Simulation Warning</AlertTitle>
                                                    {error}
                                                </Alert>
                                            ))}
                                        </Stack>
                                    )}

                                    <FilterBar
                                        filterState={filterState}
                                        onFilterChange={setFilterState}
                                        onClearFilters={handleClearFilters}
                                        title="Filter Preferred Players"
                                        showCategoryFilter={true}
                                    />
                                    <Box sx={{ 
                                        mt: 3,
                                        '& .MuiPaper-root': {
                                            borderRadius: 2,
                                            boxShadow: (theme) => `0 4px 20px ${theme.palette.grey[200]}`,
                                            overflow: 'hidden'
                                        }
                                    }}>
                                        <PreferredPlayersTable
                                            players={sortPlayers(filterPlayers(preferredPlayers))}
                                            onEdit={handlePreferenceEdit}
                                            onDeleteClick={handleDeleteClick}
                                            deleteConfirmation={deleteConfirmation}
                                            onDeleteCancel={handleDeleteCancel}
                                            onDeleteConfirm={handleDeleteConfirm}
                                            onAdd={() => setIsAddPlayerDialogOpen(true)}
                                            isLoading={loading}
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Dialogs */}
                <Grid item xs={12}>
                    <EditPreferenceDialog
                        open={!!editingPreference}
                        player={editingPreference}
                        onClose={() => setEditingPreference(null)}
                        onSave={handlePreferenceUpdate}
                    />

                    <AddPreferredPlayer
                        open={isAddPlayerDialogOpen}
                        onClose={() => setIsAddPlayerDialogOpen(false)}
                        onAdd={handleAddPreferredPlayers}
                        teamId={teamId}
                        availablePlayers={teamData.available_players || []}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Snackbar
                        open={notification.open}
                        autoHideDuration={6000}
                        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Alert 
                            onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
                            severity={notification.severity}
                            sx={{ 
                                width: '100%',
                                borderRadius: 2,
                                boxShadow: (theme) => 
                                    notification.severity === 'success' 
                                        ? `0 4px 12px ${theme.palette.success.light}25`
                                        : `0 4px 12px ${theme.palette.error.light}25`,
                                '& .MuiAlert-icon': {
                                    color: notification.severity === 'success' ? 'success.main' : 'error.main'
                                }
                            }}
                        >
                            {notification.message}
                        </Alert>
                    </Snackbar>
                </Grid>
            </Grid>
        </div>
    );
}