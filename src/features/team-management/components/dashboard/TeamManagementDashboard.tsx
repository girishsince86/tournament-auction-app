import { useState } from 'react';
import {
    Box,
    Paper,
    Tab,
    Tabs,
    Stack,
    Alert,
    AlertTitle,
    Snackbar
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { TeamHeader } from './TeamHeader';
import { CurrentSquadTable } from './CurrentSquadTable';
import { PreferredPlayersTable } from './PreferredPlayersTable';
import { TeamBudget } from './TeamBudget';
import { FilterBar } from '../shared/FilterBar';
import { EditPreferenceDialog } from '../dialogs/EditPreferenceDialog';
import { AddPreferredPlayer } from '../dialogs/AddPreferredPlayer';
import { SimulationSummary } from '../simulation/SimulationSummary';

import { useTeamData } from '../../hooks/useTeamData';
import { usePlayerPreferences } from '../../hooks/usePlayerPreferences';
import { useFiltersAndSort } from '../../hooks/useFiltersAndSort';
import { useTeamSimulation } from '../../hooks/useTeamSimulation';
import { DASHBOARD_TABS } from '../../constants';
import type { PlayerWithPreference } from '../../types';

interface TeamManagementDashboardProps {
    teamId: string;
}

export function TeamManagementDashboard({ teamId }: TeamManagementDashboardProps) {
    const supabase = createClientComponentClient();

    // State management hooks
    const { 
        loading, 
        error, 
        teamData, 
        budgetDetails,
        budgetMetrics,
        refreshTeamData 
    } = useTeamData(teamId);

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

    // Simulation state
    const {
        simulationState,
        validateSimulation
    } = useTeamSimulation({
        isPreAuction: true, // TODO: Get this from tournament state
        allocatedPlayers: teamData?.players || [],
        preferredPlayers: teamData?.available_players.filter(p => p.is_preferred) || [],
        teamRequirements: teamData?.requirements || [],
        categoryRequirements: teamData?.categoryRequirements || [],
        teamBudget: budgetDetails || { initial_budget: 0, remaining_budget: 0, allocated_budget: 0 },
        maxPlayers: teamData?.max_players || 0
    });

    // Local state
    const [selectedTab, setSelectedTab] = useState(0);
    const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        severity: 'success' | 'error';
        open: boolean;
    }>({ message: '', severity: 'success', open: false });

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

    // First get preferred players
    const preferredPlayers = teamData.available_players.filter((p: PlayerWithPreference) => p.is_preferred);
    
    // Then get available players excluding already preferred ones
    const availablePlayers = teamData.available_players.filter((p: PlayerWithPreference) => !p.is_preferred);
    
    // Apply filters and sorting only to non-preferred available players
    const filteredPlayers = sortPlayers(filterPlayers(availablePlayers));

    // Get simulation validation results
    const validationResult = validateSimulation();

    const handleAddPreferredPlayers = async (selectedPlayers: { player_id: string; max_bid: number }[]) => {
        try {
            console.log('Adding preferred players:', selectedPlayers);

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

            // Check if user is admin
            const isAdmin = session.user.email?.endsWith('@pbel.in');

            if (!isAdmin) {
                // Only verify team ownership if not admin
                const { data: team, error: teamError } = await supabase
                    .from('teams')
                    .select('owner_id')
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

                if (!team) {
                    setNotification({
                        message: 'Team not found',
                        severity: 'error',
                        open: true
                    });
                    return;
                }

                if (team.owner_id !== session.user.id) {
                    setNotification({
                        message: 'You are not authorized to modify this team\'s preferences',
                        severity: 'error',
                        open: true
                    });
                    return;
                }
            }

            const response = await fetch(`/api/teams/${teamId}/preferred-players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_ids: selectedPlayers.map(p => p.player_id),
                    max_bids: selectedPlayers.map(p => p.max_bid)
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
        <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
                {/* Team Header */}
                <TeamHeader team={teamData} />

                {/* Budget Overview */}
                <TeamBudget
                    teamId={teamId}
                    budget={budgetDetails}
                    metrics={budgetMetrics}
                    isLoading={loading}
                />

                {/* Main Content */}
                <Paper>
                    <Tabs
                        value={selectedTab}
                        onChange={(_, newValue) => setSelectedTab(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {DASHBOARD_TABS.map(tab => (
                            <Tab
                                key={tab.value}
                                icon={<tab.icon />}
                                label={tab.label}
                                value={tab.value}
                            />
                        ))}
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        {selectedTab === 0 && (
                            <>
                                <FilterBar
                                    filterState={filterState}
                                    onFilterChange={setFilterState}
                                    onClearFilters={handleClearFilters}
                                    title="Filter Squad"
                                />
                                <Box sx={{ mt: 2 }}>
                                    <CurrentSquadTable
                                        players={teamData.players}
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
                                    <Stack spacing={2} sx={{ mt: 3, mb: 2 }}>
                                        {validationResult.errors.map((error: string, index: number) => (
                                            <Alert key={index} severity="error">
                                                <AlertTitle>Simulation Warning</AlertTitle>
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
                                />
                                <Box sx={{ mt: 2 }}>
                                    <PreferredPlayersTable
                                        players={preferredPlayers}
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

                        {selectedTab === 2 && (
                            <Box>
                                {/* Team Requirements component will be added here */}
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Stack>

            {/* Dialogs */}
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
                availablePlayers={filteredPlayers}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 