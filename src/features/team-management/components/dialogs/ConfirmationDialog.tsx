import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmationDialog({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ConfirmationDialogProps) {
    return (
        <Dialog 
            open={open} 
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{cancelText}</Button>
                <Button 
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 