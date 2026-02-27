'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Button,
    Stack,
    Divider
} from '@mui/material';
import { TeamBudget } from '@/features/team-management/components/dashboard/TeamBudget';
import { PreferredPlayersTable } from '@/features/team-management/components/dashboard/PreferredPlayersTable';
import { AddPreferredPlayer } from '@/features/team-management/components/dialogs/AddPreferredPlayer';
import type { PlayerWithPreference } from '@/features/team-management/types/player';
import AddIcon from '@mui/icons-material/Add';

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
            id={`preferred-players-tabpanel-${index}`}
            aria-labelledby={`preferred-players-tab-${index}`}
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
        id: `preferred-players-tab-${index}`,
        'aria-controls': `preferred-players-tabpanel-${index}`,
    };
}

export default function PreferredPlayersPage({ params }: { params: { teamId: string } }) {
    const [selectedTab, setSelectedTab] = useState(0);
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [players, setPlayers] = useState<PlayerWithPreference[]>([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        open: boolean;
        playerId: string | null;
        playerName: string;
    }>({
        open: false,
        playerId: null,
        playerName: ''
    });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState<PlayerWithPreference[]>([]);

    // Fetch preferred players and available players
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch preferred players
                const preferredResponse = await fetch(`/api/teams/${params.teamId}/preferred-players`);
                if (!preferredResponse.ok) {
                    throw new Error('Failed to fetch preferred players');
                }
                const preferredData = await preferredResponse.json();
                setPlayers(preferredData.players || []);
                
                // Fetch available players for the add dialog
                // Using the correct status values: AVAILABLE and UNALLOCATED
                const availableResponse = await fetch(`/api/players?status=AVAILABLE`);
                if (!availableResponse.ok) {
                    throw new Error('Failed to fetch available players');
                }
                const availableData = await availableResponse.json();
                
                // If we didn't get any players with AVAILABLE status, try with UNALLOCATED
                let availablePlayers = availableData.players || [];
                if (availablePlayers.length === 0) {
                    const unallocatedResponse = await fetch(`/api/players?status=UNALLOCATED`);
                    if (unallocatedResponse.ok) {
                        const unallocatedData = await unallocatedResponse.json();
                        availablePlayers = unallocatedData.players || [];
                    }
                }
                
                // Filter out players that are already in the preferred list
                const preferredIds = new Set((preferredData.players || []).map((p: PlayerWithPreference) => p.id));
                const filteredAvailablePlayers = availablePlayers.filter(
                    (p: PlayerWithPreference) => !preferredIds.has(p.id)
                );
                
                console.log('Available players:', filteredAvailablePlayers.length);
                setAvailablePlayers(filteredAvailablePlayers);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.teamId, refreshTrigger]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleAddPlayerSuccess = () => {
        setIsAddingPlayer(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEditPlayer = (player: PlayerWithPreference) => {
        // Implementation of handleEditPlayer
    };

    const handleDeleteClick = (playerId: string, playerName: string) => {
        setDeleteConfirmation({
            open: true,
            playerId,
            playerName
        });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({
            open: false,
            playerId: null,
            playerName: ''
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmation.playerId) return Promise.resolve();
        
        try {
            const response = await fetch(`/api/teams/${params.teamId}/preferred-players?playerId=${deleteConfirmation.playerId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove player from preferences');
            }
            
            // Refresh the list
            setRefreshTrigger(prev => prev + 1);
            
            // Close the confirmation dialog
            handleDeleteCancel();
            
            return Promise.resolve();
        } catch (error) {
            console.error('Error removing player:', error);
            return Promise.reject(error);
        }
    };

    const handleAddPlayer = () => {
        setIsAddDialogOpen(true);
    };

    const handleAddDialogClose = () => {
        setIsAddDialogOpen(false);
    };

    const handleAddPlayers = async (selectedPlayers: { player_id: string; max_bid: number }[]) => {
        try {
            console.log('handleAddPlayers called with:', selectedPlayers);
            
            if (!selectedPlayers || selectedPlayers.length === 0) {
                console.warn('No players selected');
                return Promise.resolve();
            }
            
            const player_ids = selectedPlayers.map(p => p.player_id);
            const max_bids = selectedPlayers.map(p => p.max_bid);
            
            console.log('Making API request with:', { player_ids, max_bids });
            
            const response = await fetch(`/api/teams/${params.teamId}/preferred-players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ player_ids, max_bids }),
            });
            
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API error response:', errorData);
                throw new Error(`Failed to add preferred players: ${errorData.error || response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('API response data:', responseData);
            
            // Refresh the list
            setRefreshTrigger(prev => prev + 1);
            
            return Promise.resolve();
        } catch (error) {
            console.error('Error adding preferred players:', error);
            return Promise.reject(error);
        }
    };

    return (
        <div className="p-4">
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Preferred Players for Auction
                </Typography>
                <Typography color="textSecondary">
                    Manage your preferred players list and monitor budget allocation
                </Typography>
            </Box>

            <Stack spacing={3}>
                <TeamBudget
                    teamId={params.teamId}
                    isLoading={isLoading}
                />
                <Box>
                    <PreferredPlayersTable
                        players={players}
                        onEdit={handleEditPlayer}
                        onDeleteClick={handleDeleteClick}
                        deleteConfirmation={deleteConfirmation}
                        onDeleteCancel={handleDeleteCancel}
                        onDeleteConfirm={handleDeleteConfirm}
                        onAdd={handleAddPlayer}
                        isLoading={isLoading}
                    />
                </Box>
                <AddPreferredPlayer
                    open={isAddDialogOpen}
                    onClose={handleAddDialogClose}
                    onAdd={handleAddPlayers}
                    teamId={params.teamId}
                    availablePlayers={availablePlayers}
                />
            </Stack>
        </div>
    );
} 