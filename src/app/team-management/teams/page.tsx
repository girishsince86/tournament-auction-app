'use client'

import { Box, Typography, Paper, Grid } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function TeamsPage() {
  const router = useRouter()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Teams Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team List
            </Typography>
            {/* Team list content will go here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 