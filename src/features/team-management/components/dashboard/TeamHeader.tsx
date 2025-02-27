import {
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    Tooltip
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { TeamData } from '../../types';
import { TeamNameEditor } from './TeamNameEditor';

interface TeamHeaderProps {
    team: TeamData;
    isLoading?: boolean;
    onTeamUpdate?: () => void;
}

export function TeamHeader({ team, isLoading, onTeamUpdate }: TeamHeaderProps) {
    if (isLoading) {
        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ height: 60, bgcolor: 'background.paper' }} />
            </Paper>
        );
    }

    const ownerName = team.team_owners?.[0]?.name || 'Unknown Owner';
    const budgetInCrores = (team.initial_budget || 0) / 10000000; // Convert to crores

    return (
        <Paper 
            sx={{ 
                p: 3, 
                mb: 3,
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white'
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h5" gutterBottom>
                            {team.name}
                        </Typography>
                        <TeamNameEditor 
                            teamId={team.id}
                            currentName={team.name}
                            onNameUpdated={onTeamUpdate || (() => {})}
                        />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Tooltip title="Team Owner">
                            <Chip
                                icon={<GroupsIcon />}
                                label={ownerName}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                            />
                        </Tooltip>
                        {team.tournament && (
                            <Tooltip title="Tournament">
                                <Chip
                                    icon={<EmojiEventsIcon />}
                                    label={team.tournament.name}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                </Box>
                <Box>
                    <Typography variant="h6">
                        Players: {team.players?.length || 0} / {team.max_players || 0}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Budget: {budgetInCrores.toLocaleString()} Cr points
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
} 