'use client';

import { useParams } from 'next/navigation';
import { TeamManagementDashboard } from '@/features/team-management/components/dashboard/TeamManagementDashboard';
import { Box, Container, Typography, Paper, CircularProgress } from '@mui/material';
import { useTeamAccess } from '@/features/team-management/hooks/useTeamAccess';

export default function TeamManagementPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    if (!teamId) {
        return (
            <Container maxWidth="xl">
                <Box py={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography color="error">
                            Team ID is required
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        );
    }

    const { isLoading, isAuthorized, error } = useTeamAccess(teamId);

    if (isLoading) {
        return (
            <Container maxWidth="xl">
                <Box py={4} display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !isAuthorized) {
        return (
            <Container maxWidth="xl">
                <Box py={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography color="error">
                            {error || 'You do not have permission to access this team\'s data'}
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box py={4}>
                <TeamManagementDashboard teamId={teamId} />
            </Box>
        </Container>
    );
} 