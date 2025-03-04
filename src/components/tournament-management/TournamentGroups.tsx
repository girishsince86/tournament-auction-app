'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { getPublicTournamentGroups, TournamentGroupData } from '@/lib/api/public';
import { MatchStatus } from '@/types/tournament-management';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `group-tab-${index}`,
    'aria-controls': `group-tabpanel-${index}`,
  };
}

// Match status chip colors
const statusColors: Record<MatchStatus, string> = {
  'SCHEDULED': 'default',
  'IN_PROGRESS': 'primary',
  'COMPLETED': 'success',
  'CANCELLED': 'error'
};

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Format time for display
function formatTime(timeString: string): string {
  // Assuming timeString is in format "HH:MM:SS"
  return timeString.substring(0, 5);
}

interface TournamentGroupsProps {
  tournamentId: string;
  formatId?: string;
  formatType?: string;
}

export function TournamentGroups({ tournamentId, formatId, formatType }: TournamentGroupsProps) {
  const [groups, setGroups] = useState<TournamentGroupData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        setError(null);
        
        const groupsData = await getPublicTournamentGroups(
          tournamentId,
          formatId,
          formatType
        );
        
        setGroups(groupsData);
      } catch (err) {
        console.error('Error fetching tournament groups:', err);
        setError('Failed to load tournament groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchGroups();
  }, [tournamentId, formatId, formatType]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (groups.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No tournament groups found.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="tournament groups"
          variant={groups.length > 3 ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          {groups.map((group, index) => (
            <Tab key={group.id} label={group.name} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      
      {groups.map((group, index) => (
        <TabPanel key={group.id} value={activeTab} index={index}>
          <Typography variant="h5" component="h2" gutterBottom>
            {group.name}
          </Typography>
          
          {group.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {group.description}
            </Typography>
          )}
          
          <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 2 }}>
            Standings
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small" aria-label="group standings">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell align="center">P</TableCell>
                  <TableCell align="center">MP</TableCell>
                  <TableCell align="center">W</TableCell>
                  <TableCell align="center">L</TableCell>
                  <TableCell align="center">SW</TableCell>
                  <TableCell align="center">SL</TableCell>
                  <TableCell align="center">PS</TableCell>
                  <TableCell align="center">PC</TableCell>
                  <TableCell align="center">Win%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.standings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">No standings available</TableCell>
                  </TableRow>
                ) : (
                  group.standings.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.ranking || '-'}</TableCell>
                      <TableCell>{team.team_name}</TableCell>
                      <TableCell align="center">{team.points}</TableCell>
                      <TableCell align="center">{team.matches_played}</TableCell>
                      <TableCell align="center">{team.matches_won}</TableCell>
                      <TableCell align="center">{team.matches_lost}</TableCell>
                      <TableCell align="center">{team.sets_won}</TableCell>
                      <TableCell align="center">{team.sets_lost}</TableCell>
                      <TableCell align="center">{team.points_scored}</TableCell>
                      <TableCell align="center">{team.points_conceded}</TableCell>
                      <TableCell align="center">{team.win_percentage}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Typography variant="h6" component="h3" sx={{ mt: 4, mb: 2 }}>
            Matches
          </Typography>
          
          {group.matches.length === 0 ? (
            <Alert severity="info">No matches scheduled for this group</Alert>
          ) : (
            <Grid container spacing={2}>
              {group.matches.map((match) => (
                <Grid item xs={12} sm={6} md={4} key={match.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatDate(match.scheduled_date)}
                        </Typography>
                        <Chip 
                          label={match.status} 
                          size="small" 
                          color={statusColors[match.status] as any} 
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        {formatTime(match.scheduled_start_time)} - {formatTime(match.scheduled_end_time)}
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {match.team1_name}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          vs
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {match.team2_name}
                        </Typography>
                      </Box>
                      
                      {match.court_name && (
                        <Typography variant="body2" color="text.secondary">
                          Court: {match.court_name}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      ))}
    </Box>
  );
} 