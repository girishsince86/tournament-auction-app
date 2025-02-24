'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Rule as RuleIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';

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
      id={`tournament-tabpanel-${index}`}
      aria-labelledby={`tournament-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TournamentManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const supabase = createClientComponentClient<Database>();

  const { data: activeTournament, isLoading } = useQuery({
    queryKey: ['active-tournament'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box p={3}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!activeTournament) {
    return (
      <Box p={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              No Active Tournament
            </Typography>
            <Typography color="text.secondary" paragraph>
              Please activate a tournament from the Tournaments page to manage its settings.
            </Typography>
            <Button
              variant="contained"
              href="/admin/tournaments"
              color="primary"
            >
              Go to Tournaments
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {activeTournament.name}
        </Typography>
        <Typography color="text.secondary">
          {activeTournament.description}
        </Typography>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<SettingsIcon />} 
            label="General Settings" 
            iconPosition="start"
          />
          <Tab 
            icon={<ScheduleIcon />} 
            label="Schedule" 
            iconPosition="start"
          />
          <Tab 
            icon={<CategoryIcon />} 
            label="Categories" 
            iconPosition="start"
          />
          <Tab 
            icon={<RuleIcon />} 
            label="Rules" 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Basic Settings</Typography>
                    <Typography>
                      Team Budget: {activeTournament.team_budget.toLocaleString()} points
                    </Typography>
                    <Typography>
                      Registration Deadline: {new Date(activeTournament.registration_deadline).toLocaleDateString()}
                    </Typography>
                    <Button variant="contained" color="primary">
                      Edit Settings
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Tournament Status</Typography>
                    <Typography color="success.main">
                      Active
                    </Typography>
                    <Button variant="outlined" color="warning">
                      Deactivate Tournament
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Tournament Schedule</Typography>
          {/* Add schedule management components */}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Player Categories</Typography>
          {/* Add category management components */}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6">Tournament Rules</Typography>
          {/* Add rules management components */}
        </TabPanel>
      </Paper>
    </Box>
  );
}
