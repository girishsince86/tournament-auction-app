import { useState } from 'react';
import type { PlayerWithPreference, SelectedPlayerData } from '../types';

interface UsePlayerPreferencesReturn {
    selectedPlayers: SelectedPlayerData[];
    handlePlayerSelection: (player: PlayerWithPreference) => void;
    handleMaxBidChange: (playerId: string, maxBid: number) => void;
    handleAddSelectedPlayers: () => Promise<void>;
    handlePreferenceEdit: (player: PlayerWithPreference) => void;
    handlePreferenceUpdate: (playerId: string, maxBid: number, notes?: string) => Promise<void>;
    handleRemovePreference: (playerId: string) => Promise<void>;
    editingPreference: PlayerWithPreference | null;
    setEditingPreference: (player: PlayerWithPreference | null) => void;
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
    onUpdate: () => Promise<void>
): UsePlayerPreferencesReturn {
    const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayerData[]>([]);
    const [editingPreference, setEditingPreference] = useState<PlayerWithPreference | null>(null);
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

    const handlePlayerSelection = (player: PlayerWithPreference) => {
        if (player.status === 'SOLD') return;
        
        setSelectedPlayers(prev => {
            const isSelected = prev.some(p => p.player_id === player.id);
            if (isSelected) {
                return prev.filter(p => p.player_id !== player.id);
            } else {
                return [...prev, { player_id: player.id, max_bid: player.base_price }];
            }
        });
    };

    const handleMaxBidChange = (playerId: string, maxBid: number) => {
        setSelectedPlayers(prev => 
            prev.map(p => p.player_id === playerId ? { ...p, max_bid: maxBid } : p)
        );
    };

    const handleAddSelectedPlayers = async () => {
        try {
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

            if (!response.ok) {
                throw new Error('Failed to add selected players');
            }

            setSelectedPlayers([]);
            await onUpdate();
        } catch (error) {
            console.error('Error adding selected players:', error);
            setError('Failed to add selected players');
        }
    };

    const handlePreferenceEdit = (player: PlayerWithPreference) => {
        setEditingPreference({
            ...player,
            max_bid: player.preference?.max_bid || player.base_price,
            notes: player.preference?.notes || ''
        });
    };

    const handlePreferenceUpdate = async (playerId: string, maxBid: number, notes?: string) => {
        try {
            console.log('Updating preference:', { playerId, maxBid, notes }); // Debug log

            const response = await fetch(`/api/teams/${teamId}/preferred-players`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    player_id: playerId,
                    max_bid_points: maxBid,
                    notes 
                })
            });

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (!response.ok) {
                const errorMessage = data.error || 'Failed to update preference';
                if (response.status === 403) {
                    throw new Error('You do not have permission to modify this team\'s preferences');
                } else if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                } else {
                    throw new Error(errorMessage);
                }
            }
            
            await onUpdate();
            setEditingPreference(null);
            setError(null);
        } catch (error) {
            console.error('Error updating preference:', error);
            setError(error instanceof Error ? error.message : 'Failed to update preference');
            throw error; // Re-throw to be handled by the dialog
        }
    };

    const handleRemovePreference = async (playerId: string) => {
        try {
            const response = await fetch(`/api/teams/${teamId}/preferred-players?playerId=${playerId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to remove preference');
            }
            
            await onUpdate();
            setError(null);
        } catch (error) {
            console.error('Error removing preference:', error);
            setError(error instanceof Error ? error.message : 'Failed to remove preference');
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
        if (!deleteConfirmation.playerId) return;
        
        try {
            const response = await fetch(`/api/teams/${teamId}/preferred-players?playerId=${deleteConfirmation.playerId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to remove preference');
            }
            
            await onUpdate();
            setError(null);
            handleDeleteCancel();
        } catch (error) {
            console.error('Error removing preference:', error);
            setError(error instanceof Error ? error.message : 'Failed to remove preference');
            handleDeleteCancel();
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