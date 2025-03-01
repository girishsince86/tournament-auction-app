import { Box, Card, CardContent, Typography, LinearProgress, Alert, Stack, Chip, Tabs, Tab, Grid } from '@mui/material';
import { useState } from 'react';
import type { TeamCompositionStatus, PlayerCategoryRequirement } from '@/types/team-management';
import type { TeamCompositionAnalysis } from '../../utils/team-composition';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

interface TeamCompositionStatusProps {
    analysis: TeamCompositionAnalysis;
}

const RequirementsChips = () => (
    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
        <Chip
            icon={<PeopleOutlineIcon />}
            label="8-10 Players"
            size="small"
            sx={{ 
                bgcolor: 'grey.100',
                '& .MuiChip-icon': { fontSize: 16 }
            }}
        />
        <Chip
            icon={<StarOutlineIcon />}
            label="1+ Marquee"
            size="small"
            sx={{ 
                bgcolor: 'grey.100',
                '& .MuiChip-icon': { fontSize: 16 }
            }}
        />
        <Chip
            icon={<GroupsIcon />}
            label="2+ Capped"
            size="small"
            sx={{ 
                bgcolor: 'grey.100',
                '& .MuiChip-icon': { fontSize: 16 }
            }}
        />
        <Chip
            icon={<GroupsIcon />}
            label="3+ Uncapped"
            size="small"
            sx={{ 
                bgcolor: 'grey.100',
                '& .MuiChip-icon': { fontSize: 16 }
            }}
        />
    </Stack>
);

const CategoryRequirementCard = ({ requirement }: { requirement: PlayerCategoryRequirement }) => {
    const progress = requirement.max_players 
        ? (requirement.current_count / requirement.max_players) * 100
        : (requirement.current_count / requirement.min_players) * 100;
    
    const isValid = requirement.current_count >= requirement.min_players && 
        (!requirement.max_players || requirement.current_count <= requirement.max_players);

    // Add logging to help diagnose the issue
    console.log('CategoryRequirementCard:', {
        category_type: requirement.category_type,
        current_count: requirement.current_count,
        min_players: requirement.min_players,
        max_players: requirement.max_players,
        isValid,
        progress
    });

    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.primary">
                    {requirement.category_type.charAt(0).toUpperCase() + requirement.category_type.slice(1).toLowerCase()} Players
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {requirement.current_count} / {requirement.min_players}
                        {requirement.max_players ? `-${requirement.max_players}` : '+'} 
                    </Typography>
                    {isValid ? (
                        <CheckCircleOutlineIcon sx={{ color: 'success.light', fontSize: 16 }} />
                    ) : (
                        <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 16 }} />
                    )}
                </Stack>
            </Stack>
            <LinearProgress 
                variant="determinate" 
                value={Math.min(progress, 100)}
                color={isValid ? "primary" : "info"}
                sx={{ 
                    height: 6, 
                    borderRadius: 1,
                    backgroundColor: 'action.hover' 
                }}
            />
        </Box>
    );
};

const CompositionStatusContent = ({ status }: { status: TeamCompositionStatus }) => {
    const totalProgress = (status.total_players / status.max_players) * 100;
    const isTotalValid = status.total_players >= status.min_players && status.total_players <= status.max_players;

    // Add logging to help diagnose the issue
    console.log('CompositionStatusContent:', {
        status,
        totalProgress,
        isTotalValid,
        category_requirements: status.category_requirements.map(req => ({
            category_type: req.category_type,
            current_count: req.current_count,
            min_players: req.min_players,
            is_valid: req.current_count >= req.min_players
        }))
    });

    return (
        <Stack spacing={2}>
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color="text.primary">
                        Total Players
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            {status.total_players} / {status.min_players}-{status.max_players}
                        </Typography>
                        {isTotalValid ? (
                            <CheckCircleOutlineIcon sx={{ color: 'success.light', fontSize: 16 }} />
                        ) : (
                            <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 16 }} />
                        )}
                    </Stack>
                </Stack>
                <LinearProgress 
                    variant="determinate" 
                    value={Math.min(totalProgress, 100)}
                    color={isTotalValid ? "primary" : "info"}
                    sx={{ 
                        height: 6, 
                        borderRadius: 1,
                        backgroundColor: 'action.hover'
                    }}
                />
            </Box>

            <RequirementsChips />

            <Box sx={{ mt: 1 }}>
                {status.category_requirements.map((requirement, index) => (
                    <CategoryRequirementCard key={index} requirement={requirement} />
                ))}
            </Box>
        </Stack>
    );
};

export function TeamCompositionStatus({ analysis }: TeamCompositionStatusProps) {
    const [selectedTab, setSelectedTab] = useState(0);

    const currentStatus = analysis.current_squad;
    const simulatedStatus = analysis.with_preferred;

    // Add logging to help diagnose the issue
    console.log('TeamCompositionStatus:', {
        analysis,
        currentStatus,
        simulatedStatus,
        selectedTab
    });

    return (
        <Card>
            <CardContent>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <GroupsIcon color="primary" />
                        <Typography variant="h6">Team Composition</Typography>
                        <Chip 
                            icon={selectedTab === 0 ? 
                                (currentStatus.is_valid ? <CheckCircleOutlineIcon /> : <InfoOutlinedIcon />) :
                                (simulatedStatus.is_valid ? <CheckCircleOutlineIcon /> : <InfoOutlinedIcon />)
                            }
                            label={selectedTab === 0 ? 
                                (currentStatus.is_valid ? "Complete" : "In Progress") :
                                (simulatedStatus.is_valid ? "Complete" : "In Progress")
                            }
                            color={selectedTab === 0 ?
                                (currentStatus.is_valid ? "default" : "info") :
                                (simulatedStatus.is_valid ? "default" : "info")
                            }
                            size="small"
                            sx={{
                                backgroundColor: (theme) => (selectedTab === 0 ? currentStatus : simulatedStatus).is_valid 
                                    ? theme.palette.success.light 
                                    : theme.palette.info.light,
                                color: (theme) => (selectedTab === 0 ? currentStatus : simulatedStatus).is_valid 
                                    ? theme.palette.success.dark 
                                    : theme.palette.info.dark,
                                '& .MuiChip-icon': {
                                    color: 'inherit'
                                }
                            }}
                        />
                    </Stack>

                    <Tabs
                        value={selectedTab}
                        onChange={(_, newValue) => setSelectedTab(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab 
                            icon={<StarOutlineIcon />} 
                            label="With Preferred" 
                        />
                        <Tab 
                            icon={<GroupsIcon />} 
                            label="Current Squad" 
                        />
                    </Tabs>

                    <Box>
                        {selectedTab === 0 ? (
                            <CompositionStatusContent status={simulatedStatus} />
                        ) : (
                            <CompositionStatusContent status={currentStatus} />
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
} 