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

interface TeamHeaderProps {
    team: TeamData;
    isLoading?: boolean;
}

export function TeamHeader({ team, isLoading }: TeamHeaderProps) {
    if (isLoading) {
        return (
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ height: 60, bgcolor: 'background.paper' }} />
            </Paper>
        );
    }

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
                    <Typography variant="h5" gutterBottom>
                        {team.name}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        {team.owner_name && (
                            <Tooltip title="Team Owner">
                                <Chip
                                    icon={<GroupsIcon />}
                                    label={team.owner_name}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                                />
                            </Tooltip>
                        )}
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
                    <Typography variant="subtitle2">
                        Budget: ₹{(team.budget || 0).toLocaleString()}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
} 