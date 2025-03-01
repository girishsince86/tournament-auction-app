import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    InputAdornment
} from '@mui/material';
import type { PlayerWithPreference } from '../../types/player';
import { formatPointsInCrores } from '@/lib/utils/format';

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
                setError(`Max bid must be at least ${formatPointsInCrores(player.base_price)} points`);
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

    const handleMaxBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        const basePrice = player?.base_price || 0;
        // Round to nearest 10 lakhs
        const roundedValue = Math.round(value / 1000000) * 1000000;
        if (roundedValue < basePrice) {
            setError(`Max bid must be at least ${formatPointsInCrores(basePrice)} points`);
        } else {
            setError(null);
        }
        setMaxBid(roundedValue);
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
                                fullWidth
                                disabled
                                size="small"
                                label="Base Points"
                                value={`${formatPointsInCrores(player.base_price)} points`}
                            />
                            <TextField
                                label="Maximum Bid"
                                type="number"
                                value={maxBid}
                                onChange={handleMaxBidChange}
                                fullWidth
                                margin="normal"
                                required
                                error={!!error}
                                helperText={error}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">points</InputAdornment>,
                                    inputProps: {
                                        step: 1000000 // Step in 10 lakhs
                                    }
                                }}
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