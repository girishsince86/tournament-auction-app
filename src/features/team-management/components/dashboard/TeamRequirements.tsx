import { useState } from 'react';
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
    Button,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TeamCombinedRequirement } from '@/types/database';
import { PlayerChip } from '../shared/PlayerChip';
import { POSITIONS, SKILL_LEVELS } from '../../constants';

interface TeamRequirementsProps {
    requirements: TeamCombinedRequirement[];
    onAdd: () => void;
    onEdit: (requirement: TeamCombinedRequirement) => void;
    onDelete: (requirementId: string) => void;
    isLoading?: boolean;
}

export function TeamRequirements({
    requirements,
    onAdd,
    onEdit,
    onDelete,
    isLoading
}: TeamRequirementsProps) {
    if (isLoading) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                Loading requirements...
            </Paper>
        );
    }

    const getPositionConfig = (position: string) => 
        POSITIONS.find(p => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string) => 
        SKILL_LEVELS.find(s => s.value === skill) || SKILL_LEVELS[0];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    Team Requirements
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                >
                    Add Requirement
                </Button>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Position</TableCell>
                            <TableCell>Skill Level</TableCell>
                            <TableCell align="right">Min Players</TableCell>
                            <TableCell align="right">Max Players</TableCell>
                            <TableCell align="right">Current Count</TableCell>
                            <TableCell align="right">Points Allocated</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requirements.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <PlayerChip
                                        label={req.position}
                                        config={getPositionConfig(req.position)}
                                        type="position"
                                    />
                                </TableCell>
                                <TableCell>
                                    <PlayerChip
                                        label={req.skill_level}
                                        config={getSkillConfig(req.skill_level)}
                                        type="skill"
                                    />
                                </TableCell>
                                <TableCell align="right">{req.min_players}</TableCell>
                                <TableCell align="right">{req.max_players}</TableCell>
                                <TableCell align="right">
                                    <Typography
                                        color={req.current_count < req.min_players ? 'error' : 'inherit'}
                                    >
                                        {req.current_count}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    ₹{req.points_allocated.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Edit Requirement">
                                            <IconButton
                                                size="small"
                                                onClick={() => onEdit(req)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Requirement">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onDelete(req.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {requirements.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No requirements defined
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
} 