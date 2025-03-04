import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { TournamentGroups } from '@/components/tournament-management/TournamentGroups';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tournament Groups | Tournament Management',
  description: 'View tournament groups, standings, and match schedules',
};

// This is a server component that will render the client TournamentGroups component
export default function TournamentGroupsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get query parameters
  const tournamentId = 
    typeof searchParams.tournamentId === 'string' 
      ? searchParams.tournamentId 
      : '11111111-1111-1111-1111-111111111111'; // Default tournament ID
  
  const formatId = 
    typeof searchParams.formatId === 'string' 
      ? searchParams.formatId 
      : undefined;
  
  const formatType = 
    typeof searchParams.formatType === 'string' 
      ? searchParams.formatType 
      : undefined;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tournament Groups
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View tournament groups, team standings, and upcoming matches.
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 4 }}>
          <TournamentGroups 
            tournamentId={tournamentId}
            formatId={formatId}
            formatType={formatType}
          />
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Note: This page displays tournament groups and standings. You can filter by tournament, format, or format type using URL parameters.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Example: <code>/tournament-groups?tournamentId=123&formatType=VOLLEYBALL</code>
        </Typography>
      </Box>
    </Container>
  );
} 