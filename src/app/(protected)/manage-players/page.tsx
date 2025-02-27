import { Box, Typography, Paper, Grid, Card, CardContent, Chip } from '@mui/material'

export default function ManagePlayersPage() {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Players
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Player Categories
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Elite Players
                    </Typography>
                    <Chip label="Level 1" color="primary" />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Top tier players with competitive experience
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Advanced Players
                    </Typography>
                    <Chip label="Level 2" color="secondary" />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Advanced level players with strong skills
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Intermediate Players
                    </Typography>
                    <Chip label="Level 3" color="info" />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Intermediate level players with good fundamentals
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Development Players
                    </Typography>
                    <Chip label="Level 4" color="default" />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Development level players learning the game
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 