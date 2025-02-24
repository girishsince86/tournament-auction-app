'use client';

import { useState } from 'react';
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
import type { PlayerWithPreference } from '@/features/team-management/types';
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
    const [isLoading, setIsLoading] = useState(false);
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
        // Implementation of handleDeleteConfirm
        return Promise.resolve();
    };

    const handleAddPlayer = () => {
        setIsAddDialogOpen(true);
    };

    const handleAddDialogClose = () => {
        setIsAddDialogOpen(false);
    };

    const handleAddPlayers = async (selectedPlayers: { player_id: string; max_bid: number }[]) => {
        // Implementation of handleAddPlayers
        return Promise.resolve();
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