import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface TeamNameEditorProps {
    teamId: string;
    currentName: string;
    onNameUpdated: () => void;
}

export function TeamNameEditor({ teamId, currentName, onNameUpdated }: TeamNameEditorProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(currentName || '');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpen = () => {
        setOpen(true);
        setName(currentName || '');
        setError(null);
    };

    const handleClose = () => {
        setOpen(false);
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            if (!name?.trim()) {
                setError('Team name cannot be empty');
                return;
            }

            setIsSubmitting(true);
            setError(null);

            const response = await fetch(`/api/teams/${teamId}/name`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update team name');
            }

            onNameUpdated();
            handleClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update team name');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <IconButton onClick={handleOpen} size="small" color="inherit">
                <EditIcon />
            </IconButton>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Update Team Name</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            label="Team Name"
                            value={name || ''}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            autoFocus
                            error={!!error}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!name?.trim() || name === currentName || isSubmitting}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Name'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 