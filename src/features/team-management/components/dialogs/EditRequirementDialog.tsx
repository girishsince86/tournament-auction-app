import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Box
} from '@mui/material';
import type { TeamCombinedRequirement } from '@/types/database';
import { POSITIONS, SKILL_LEVELS } from '../../constants';
import { PlayerChip } from '../shared/PlayerChip';

interface EditRequirementDialogProps {
    open: boolean;
    requirement: TeamCombinedRequirement | null;
    onClose: () => void;
    onSave: (data: Partial<TeamCombinedRequirement>) => Promise<void>;
}

export function EditRequirementDialog({
    open,
    requirement,
    onClose,
    onSave
}: EditRequirementDialogProps) {
    const [formData, setFormData] = useState<Partial<TeamCombinedRequirement>>({
        position: POSITIONS[0].value,
        skill_level: SKILL_LEVELS[0].value,
        min_players: 0,
        max_players: 0,
        points_allocated: 0
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (requirement) {
            setFormData({
                position: requirement.position,
                skill_level: requirement.skill_level,
                min_players: requirement.min_players,
                max_players: requirement.max_players,
                points_allocated: requirement.points_allocated
            });
        }
    }, [requirement]);

    const handleSubmit = async () => {
        try {
            if (!formData.position || !formData.skill_level) {
                setError('Position and skill level are required');
                return;
            }

            if (formData.min_players! < 0 || formData.max_players! < formData.min_players!) {
                setError('Invalid player count range');
                return;
            }

            if (formData.points_allocated! < 0) {
                setError('Points allocated must be positive');
                return;
            }

            await onSave({
                ...formData,
                id: requirement?.id
            });

            onClose();
        } catch (error) {
            setError('Failed to save requirement');
        }
    };

    const getPositionConfig = (position: string) => 
        POSITIONS.find(p => p.value === position) || POSITIONS[0];

    const getSkillConfig = (skill: string) => 
        SKILL_LEVELS.find(s => s.value === skill) || SKILL_LEVELS[0];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {requirement ? 'Edit Requirement' : 'Add Requirement'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <FormControl fullWidth>
                        <InputLabel>Position</InputLabel>
                        <Select
                            value={formData.position}
                            label="Position"
                            onChange={(e) => setFormData({
                                ...formData,
                                position: e.target.value as TeamCombinedRequirement['position']
                            })}
                        >
                            {POSITIONS.map((pos) => (
                                <MenuItem key={pos.value} value={pos.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PlayerChip
                                            label={pos.value}
                                            config={pos}
                                            type="position"
                                        />
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Skill Level</InputLabel>
                        <Select
                            value={formData.skill_level}
                            label="Skill Level"
                            onChange={(e) => setFormData({
                                ...formData,
                                skill_level: e.target.value as TeamCombinedRequirement['skill_level']
                            })}
                        >
                            {SKILL_LEVELS.map((skill) => (
                                <MenuItem key={skill.value} value={skill.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PlayerChip
                                            label={skill.value}
                                            config={skill}
                                            type="skill"
                                        />
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Minimum Players"
                        type="number"
                        value={formData.min_players}
                        onChange={(e) => setFormData({
                            ...formData,
                            min_players: parseInt(e.target.value) || 0
                        })}
                        inputProps={{ min: 0 }}
                        fullWidth
                    />

                    <TextField
                        label="Maximum Players"
                        type="number"
                        value={formData.max_players}
                        onChange={(e) => setFormData({
                            ...formData,
                            max_players: parseInt(e.target.value) || 0
                        })}
                        inputProps={{ min: formData.min_players }}
                        fullWidth
                    />

                    <TextField
                        label="Points Allocated"
                        type="number"
                        value={formData.points_allocated}
                        onChange={(e) => setFormData({
                            ...formData,
                            points_allocated: parseInt(e.target.value) || 0
                        })}
                        inputProps={{ min: 0, step: 1000 }}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.position || !formData.skill_level}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
} 