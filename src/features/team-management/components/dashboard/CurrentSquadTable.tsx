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
    CircularProgress,
    Chip
} from '@mui/material';
import type { PlayerWithPreference } from '../../types/player';
import type { PositionConfig, SkillLevelConfig as SkillConfig, CategoryConfig } from '../../constants/index';
import { PlayerChip } from '../shared/PlayerChip';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS } from '../../constants/index';
import { formatPointsInCrores } from '@/lib/utils/format';

interface CurrentSquadTableProps {
    players?: (PlayerWithPreference & { final_bid_points?: number })[];
    isLoading?: boolean;
}

export function CurrentSquadTable({ players = [], isLoading }: CurrentSquadTableProps) {
    if (isLoading) {
        return (
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    const getPositionConfig = (position: string): PositionConfig => 
        POSITIONS.find((p: PositionConfig) => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string): SkillConfig => 
        SKILL_LEVELS.find((s: SkillConfig) => s.value === skill) || SKILL_LEVELS[0];

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Player</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Skill Level</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Base Points</TableCell>
                        <TableCell align="right">Final Bid</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.isArray(players) && players.map((player) => (
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
                                {formatPointsInCrores(player.final_bid_points || player.base_price)} points
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!Array.isArray(players) || players.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No players in current squad
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
} 