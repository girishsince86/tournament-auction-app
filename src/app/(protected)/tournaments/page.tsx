import { Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material'

export default function TournamentsPage() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Tournaments
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Tournament
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  PCVC Volley Ball and Throwball League 2025
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Annual PCVC volleyball and throwball tournament
                </Typography>
                <Typography variant="body2" paragraph>
                  Registration Deadline: December 15, 2024
                </Typography>
                <Button variant="contained" color="primary">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Past Tournaments
            </Typography>
            <Typography color="text.secondary">
              No past tournaments to display.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 