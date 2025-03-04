import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Stack,
    Avatar,
    IconButton,
    Tooltip,
    Button,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { PlayerWithCategory } from '../../utils/team-composition';
import type { PositionConfig, SkillLevelConfig as SkillConfig, CategoryConfig } from '../../constants/index';
import { PlayerChip } from '../shared/PlayerChip';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS } from '../../constants/index';
import { ConfirmationDialog } from '../dialogs/ConfirmationDialog';
import { formatPointsInCrores } from '@/lib/utils/format';

interface PreferredPlayersTableProps {
    players: PlayerWithCategory[];
    onEdit: (player: PlayerWithCategory) => void;
    onDeleteClick: (playerId: string, playerName: string) => void;
    deleteConfirmation: {
        open: boolean;
        playerId: string | null;
        playerName: string;
    };
    onDeleteCancel: () => void;
    onDeleteConfirm: () => Promise<void>;
    onAdd: () => void;
    isLoading?: boolean;
}

export function PreferredPlayersTable({ 
    players, 
    onEdit, 
    onDeleteClick,
    deleteConfirmation,
    onDeleteCancel,
    onDeleteConfirm,
    onAdd,
    isLoading 
}: PreferredPlayersTableProps) {
    if (isLoading) {
        return (
            <Paper sx={{ p: 3 }}>
                <Box sx={{ height: 400, bgcolor: 'background.paper' }} />
            </Paper>
        );
    }

    const getPositionConfig = (position: string): PositionConfig => 
        POSITIONS.find((p: PositionConfig) => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string): SkillConfig => 
        SKILL_LEVELS.find((s: SkillConfig) => s.value === skill) || SKILL_LEVELS[0];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    Preferred Players
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                >
                    Add Preferred Players
                </Button>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Player</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Skill Level</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Base Points</TableCell>
                            <TableCell align="right">Maximum Bid</TableCell>
                            <TableCell>Notes</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {players.map((player) => (
                            <TableRow key={player.id}>
                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        {player.profile_image_url && (
                                            <Avatar
                                                src={player.profile_image_url}
                                                alt={player.name}
                                                sx={{ width: 40, height: 40 }}
                                            />
                                        )}
                                        <Typography>{player.name}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {player.phone_number || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <PlayerChip
                                        label={player.player_position}
                                        config={getPositionConfig(player.player_position)}
                                        type="position"
                                    />
                                </TableCell>
                                <TableCell>
                                    <PlayerChip
                                        label={player.skill_level || 'Unknown'}
                                        config={getSkillConfig(player.skill_level || '')}
                                        type="skill"
                                    />
                                </TableCell>
                                <TableCell>
                                    {player.category ? (
                                        <Chip
                                            label={player.category.name || player.category.category_type}
                                            color="primary"
                                            size="small"
                                            sx={{
                                                bgcolor: CATEGORY_LABELS.find(c => c.value === player.category?.category_type)?.color
                                            }}
                                        />
                                    ) : '-'}
                                </TableCell>
                                <TableCell align="right">
                                    {formatPointsInCrores(player.base_price)} points
                                </TableCell>
                                <TableCell align="right">
                                    {formatPointsInCrores(player.preference?.max_bid || player.base_price)} points
                                </TableCell>
                                <TableCell>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {player.preference?.notes || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Edit Preference">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => onEdit(player)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove from Preferences">
                                            <IconButton 
                                                size="small"
                                                color="error"
                                                onClick={() => onDeleteClick(player.id, player.name)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {players.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No preferred players added
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
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
        </Box>
    );
} 