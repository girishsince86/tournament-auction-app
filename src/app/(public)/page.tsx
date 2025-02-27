'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia,
  Divider,
  useTheme
} from '@mui/material';
import { 
  SportsVolleyball as VolleyballIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const theme = useTheme();
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Volleyball Tournament Auction
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                Discover talented players, follow tournaments, and experience the excitement of volleyball auctions.
              </Typography>
              <Button 
                component={Link}
                href="/players"
                variant="contained" 
                color="secondary" 
                size="large"
                startIcon={<PeopleIcon />}
                sx={{ mr: 2, px: 4, py: 1.5 }}
              >
                Browse Players
              </Button>
              <Button 
                component={Link}
                href="/auth/login"
                variant="outlined" 
                color="inherit" 
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Sign In
              </Button>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  height: 400,
                  width: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: 3,
                  bgcolor: 'primary.dark',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <VolleyballIcon sx={{ fontSize: 120, color: 'rgba(255,255,255,0.2)' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Tournament Features
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Experience the excitement of our volleyball tournaments and player auctions
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Player Showcase</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Browse through our talented roster of volleyball players. View detailed profiles, skills, and categories.
                </Typography>
                <Button 
                  component={Link}
                  href="/players"
                  variant="outlined" 
                  color="primary"
                  fullWidth
                >
                  View Players
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, bgcolor: 'secondary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                <GavelIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Auction System</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Our innovative auction system allows team owners to bid on players and build their dream teams.
                </Typography>
                <Button 
                  component={Link}
                  href="/auth/login"
                  variant="outlined" 
                  color="secondary"
                  fullWidth
                >
                  Join Auction
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, bgcolor: 'success.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                <TrophyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Tournaments</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" paragraph>
                  Follow exciting tournaments throughout the season. Check schedules, results, and team standings.
                </Typography>
                <Button 
                  component={Link}
                  href="/auth/login"
                  variant="outlined" 
                  color="success"
                  fullWidth
                >
                  View Tournaments
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Call to Action */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to join the excitement?
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Sign up now to participate in auctions, manage teams, and follow tournaments.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              component={Link}
              href="/auth/login"
              variant="contained" 
              color="primary" 
              size="large"
            >
              Sign In
            </Button>
            <Button 
              component={Link}
              href="/players"
              variant="outlined" 
              color="primary" 
              size="large"
            >
              Browse Players
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 