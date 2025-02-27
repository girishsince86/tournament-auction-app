import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Stack,
    Avatar,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmationDialog } from '../dialogs/ConfirmationDialog';
import type { PlayerWithPreference } from '../../types/player';

export function PreferredPlayersTable({
    players,
    onEdit,
    onRemove,
    onDeleteClick,
    deleteConfirmation,
    onDeleteCancel,
    onDeleteConfirm
}: {
    players: PlayerWithPreference[];
    onEdit: (player: PlayerWithPreference) => void;
    onRemove: (playerId: string) => Promise<void>;
    onDeleteClick: (playerId: string, playerName: string) => void;
    deleteConfirmation: {
        open: boolean;
        playerId: string | null;
        playerName: string;
    };
    onDeleteCancel: () => void;
    onDeleteConfirm: () => Promise<void>;
}) {
    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        {players.map((player) => (
                            <TableRow key={player.id}>
                                <TableCell>
                                    <IconButton
                                        onClick={() => onEdit(player)}
                                        size="small"
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => onDeleteClick(player.id, player.name)}
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ConfirmationDialog
                open={deleteConfirmation.open}
                title="Remove Player"
                message={`Are you sure you want to remove ${deleteConfirmation.playerName} from your preferred players list?`}
                onConfirm={onDeleteConfirm}
                onCancel={onDeleteCancel}
                confirmText="Remove"
                cancelText="Cancel"
            />
        </>
    );
} 