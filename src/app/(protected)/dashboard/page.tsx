'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Paper, Grid } from '@mui/material'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/registration-summary')
  }, [router])

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to the League Auction App
            </Typography>
            <Typography>
              This is your dashboard where you can view tournament information,
              manage your team, and participate in auctions.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Typography>
              • View active tournaments<br />
              • Check player listings<br />
              • Access registration details
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 