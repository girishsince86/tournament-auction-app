import { Box, Card, CardContent, Typography, LinearProgress, Alert, Stack, Chip, Tabs, Tab, Grid, Tooltip } from '@mui/material';
import { useState } from 'react';
import type { TeamCompositionStatus, PlayerCategoryRequirement } from '@/types/team-management';
import type { TeamCompositionAnalysis } from '../../utils/team-composition';
import type { PlayerCounts } from '../../types/team';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

interface TeamCompositionStatusProps {
    analysis: TeamCompositionAnalysis;
    playerCounts?: PlayerCounts;
}

const RequirementsChips = ({ playerCounts }: { playerCounts?: PlayerCounts }) => {
    // Use player counts from API if available, otherwise use default values
    const totalPlayers = playerCounts?.total || 0;
    const marqueePlayers = playerCounts?.marquee || 0;
    const cappedPlayers = playerCounts?.capped || 0;
    const uncappedPlayers = playerCounts?.uncapped || 0;

    return (
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
            <Chip
                icon={<PeopleOutlineIcon />}
                label={`${totalPlayers}/8-10 Players`}
                size="small"
                sx={{ 
                    bgcolor: 'grey.800',
                    '& .MuiChip-icon': { fontSize: 16 }
                }}
            />
            <Chip
                icon={<StarOutlineIcon />}
                label={`${marqueePlayers}/1+ Marquee`}
                size="small"
                sx={{ 
                    bgcolor: 'grey.800',
                    '& .MuiChip-icon': { fontSize: 16 }
                }}
            />
            <Chip
                icon={<GroupsIcon />}
                label={`${cappedPlayers}/2+ Capped`}
                size="small"
                sx={{ 
                    bgcolor: 'grey.800',
                    '& .MuiChip-icon': { fontSize: 16 }
                }}
            />
            <Chip
                icon={<GroupsIcon />}
                label={`${uncappedPlayers}/3+ Uncapped`}
                size="small"
                sx={{ 
                    bgcolor: 'grey.800',
                    '& .MuiChip-icon': { fontSize: 16 }
                }}
            />
        </Stack>
    );
};

const CategoryRequirementCard = ({ requirement, playerCounts }: { requirement: PlayerCategoryRequirement, playerCounts?: PlayerCounts }) => {
    // Get the actual count from API data if available
    let actualCount = requirement.current_count;
    
    if (playerCounts) {
        if (requirement.category_type === 'MARQUEE') {
            actualCount = playerCounts.marquee;
        } else if (requirement.category_type === 'CAPPED') {
            actualCount = playerCounts.capped;
        } else if (requirement.category_type === 'UNCAPPED') {
            actualCount = playerCounts.uncapped;
        }
    }
    
    const progress = requirement.max_players 
        ? (actualCount / requirement.max_players) * 100
        : (actualCount / requirement.min_players) * 100;
    
    const isValid = actualCount >= requirement.min_players && 
        (!requirement.max_players || actualCount <= requirement.max_players);

    return (
        <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.primary">
                    {requirement.category_type.charAt(0).toUpperCase() + requirement.category_type.slice(1).toLowerCase()} Players
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        {actualCount} / {requirement.min_players}
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

const CompositionStatusContent = ({ status, playerCounts }: { status: TeamCompositionStatus, playerCounts?: PlayerCounts }) => {
    // Use total players from API if available
    const totalPlayers = playerCounts?.total || status.total_players;
    const totalProgress = (totalPlayers / status.max_players) * 100;
    const isTotalValid = totalPlayers >= status.min_players && totalPlayers <= status.max_players;

    return (
        <Stack spacing={2}>
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color="text.primary">
                        Total Players
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            {totalPlayers} / {status.min_players}-{status.max_players}
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

            <RequirementsChips playerCounts={playerCounts} />

            <Box sx={{ mt: 1 }}>
                {status.category_requirements.map((requirement, index) => (
                    <CategoryRequirementCard 
                        key={index} 
                        requirement={requirement} 
                        playerCounts={playerCounts}
                    />
                ))}
            </Box>
        </Stack>
    );
};

export function TeamCompositionStatus({ analysis, playerCounts }: TeamCompositionStatusProps) {
    const [selectedTab, setSelectedTab] = useState(0);

    const currentStatus = analysis.current_squad;
    const simulatedStatus = analysis.with_preferred;

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
                            icon={<GroupsIcon />} 
                            label="Current Squad" 
                        />
                        <Tooltip title="Pre-auction simulation with only preferred players">
                            <Tab 
                                icon={<StarOutlineIcon />} 
                                label="Preferred Only" 
                            />
                        </Tooltip>
                    </Tabs>

                    <Box>
                        {selectedTab === 0 ? (
                            <CompositionStatusContent status={currentStatus} playerCounts={playerCounts} />
                        ) : (
                            <CompositionStatusContent status={simulatedStatus} playerCounts={undefined} />
                        )}
                    </Box>

                    {selectedTab === 1 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            This is a pre-auction simulation showing only your preferred players. 
                            Current squad players are not included in this view.
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
} 