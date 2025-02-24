'use client';

import { useParams } from 'next/navigation';
import { TeamManagementDashboard } from '@/features/team-management/components/dashboard/TeamManagementDashboard';
import { Box, Container, Typography, Paper } from '@mui/material';

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

    return (
        <Container maxWidth="xl">
            <Box py={4}>
                <TeamManagementDashboard teamId={teamId} />
            </Box>
        </Container>
    );
} 