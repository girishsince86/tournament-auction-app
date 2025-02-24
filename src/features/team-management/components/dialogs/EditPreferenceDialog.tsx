import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert
} from '@mui/material';
import type { PlayerWithPreference } from '../../types';

interface EditPreferenceDialogProps {
    open: boolean;
    player: PlayerWithPreference | null;
    onClose: () => void;
    onSave: (playerId: string, maxBid: number, notes?: string) => Promise<void>;
}

export function EditPreferenceDialog({
    open,
    player,
    onClose,
    onSave
}: EditPreferenceDialogProps) {
    const [maxBid, setMaxBid] = useState<number>(0);
    const [notes, setNotes] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (player) {
            setMaxBid(player.preference?.max_bid || player.base_price);
            setNotes(player.preference?.notes || '');
            setError(null);
        }
    }, [player]);

    const handleSave = async () => {
        try {
            if (!player) return;
            setError(null);
            setIsSaving(true);

            if (maxBid < player.base_price) {
                setError(`Max bid must be at least ${player.base_price}`);
                return;
            }

            await onSave(player.id, maxBid, notes);
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update preference');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Edit Player Preference
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    {player && (
                        <>
                            <TextField
                                label="Player Name"
                                value={player.name}
                                disabled
                                fullWidth
                            />
                            <TextField
                                label="Base Price"
                                value={`₹${player.base_price.toLocaleString()}`}
                                disabled
                                fullWidth
                            />
                            <TextField
                                label="Max Bid"
                                type="number"
                                value={maxBid}
                                onChange={(e) => setMaxBid(Number(e.target.value))}
                                error={maxBid < (player.base_price || 0)}
                                helperText={maxBid < (player.base_price || 0) ? 'Must be ≥ base price' : ''}
                                InputProps={{
                                    startAdornment: '₹',
                                    inputProps: { min: player.base_price }
                                }}
                                fullWidth
                            />
                            <TextField
                                label="Notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={!player || maxBid < (player.base_price || 0) || isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 