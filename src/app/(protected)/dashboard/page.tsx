'use client'

import { Typography, Grid, Paper, Box } from '@mui/material'
import { useAuth } from '@/features/auth/context/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Active Tournaments</Typography>
            <Typography variant="h4">3</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Teams</Typography>
            <Typography variant="h4">12</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Registered Players</Typography>
            <Typography variant="h4">48</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Upcoming Auctions</Typography>
            <Typography variant="h4">2</Typography>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography color="text.secondary">
              No recent activity
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 