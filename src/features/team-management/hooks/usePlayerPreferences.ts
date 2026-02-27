import { useState, useCallback } from 'react';
import type { PlayerWithCategory } from '../utils/team-composition';

interface UsePlayerPreferencesResult {
    selectedPlayers: string[];
    handlePlayerSelection: (player: PlayerWithCategory) => void;
    handleMaxBidChange: (playerId: string, maxBid: number) => void;
    handleAddSelectedPlayers: () => Promise<void>;
    handlePreferenceEdit: (player: PlayerWithCategory) => void;
    handlePreferenceUpdate: (playerId: string, maxBid: number, notes?: string) => Promise<void>;
    handleRemovePreference: (playerId: string) => Promise<void>;
    editingPreference: PlayerWithCategory | null;
    setEditingPreference: (player: PlayerWithCategory | null) => void;
    error: string | null;
    deleteConfirmation: {
        open: boolean;
        playerId: string | null;
        playerName: string;
    };
    handleDeleteClick: (playerId: string, playerName: string) => void;
    handleDeleteCancel: () => void;
    handleDeleteConfirm: () => Promise<void>;
}

export function usePlayerPreferences(
    teamId: string,
    refreshTeamData: () => Promise<void>
): UsePlayerPreferencesResult {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [maxBids, setMaxBids] = useState<Record<string, number>>({});
    const [editingPreference, setEditingPreference] = useState<PlayerWithCategory | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        open: boolean;
        playerId: string | null;
        playerName: string;
    }>({
        open: false,
        playerId: null,
        playerName: ''
    });

    const handlePlayerSelection = (player: PlayerWithCategory) => {
        setSelectedPlayers(prev => {
            const isSelected = prev.includes(player.id);
            if (isSelected) {
                // Remove player from selection
                const newSelected = prev.filter(id => id !== player.id);
                // Also remove max bid if exists
                const { [player.id]: _, ...restMaxBids } = maxBids;
                setMaxBids(restMaxBids);
                return newSelected;
            } else {
                // Add player to selection with default max bid
                setMaxBids(prev => ({
                    ...prev,
                    [player.id]: player.base_price
                }));
                return [...prev, player.id];
            }
        });
    };

    const handleMaxBidChange = useCallback((playerId: string, maxBid: number) => {
        setMaxBids(prev => ({
            ...prev,
            [playerId]: maxBid
        }));
    }, []);

    const handleAddSelectedPlayers = async () => {
        try {
            const selectedPlayersData = selectedPlayers.map(playerId => ({
                player_id: playerId,
                max_bid: maxBids[playerId]
            }));

            await refreshTeamData();
            setSelectedPlayers([]);
            setMaxBids({});
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to add selected players');
        }
    };

    const handlePreferenceEdit = (player: PlayerWithCategory) => {
        setEditingPreference(player);
    };

    const handlePreferenceUpdate = async (playerId: string, maxBid: number, notes?: string) => {
        try {
            const response = await fetch(`/api/teams/${teamId}/preferred-players`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_id: playerId,
                    max_bid_points: maxBid,
                    notes
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update preference');
            }

            await refreshTeamData();
            setEditingPreference(null);
        } catch (error) {
            throw error;
        }
    };

    const handleRemovePreference = async (playerId: string) => {
        try {
            const response = await fetch(`/api/teams/${teamId}/preferred-players?playerId=${playerId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove preference');
            }

            await refreshTeamData();
        } catch (error) {
            throw error;
        }
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
        try {
            if (!deleteConfirmation.playerId) return;
            await handleRemovePreference(deleteConfirmation.playerId);
            handleDeleteCancel();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to remove preference');
        }
    };

    return {
        selectedPlayers,
        handlePlayerSelection,
        handleMaxBidChange,
        handleAddSelectedPlayers,
        handlePreferenceEdit,
        handlePreferenceUpdate,
        handleRemovePreference,
        editingPreference,
        setEditingPreference,
        error,
        deleteConfirmation,
        handleDeleteClick,
        handleDeleteCancel,
        handleDeleteConfirm
    };
} 