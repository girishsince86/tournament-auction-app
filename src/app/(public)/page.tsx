'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Divider,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import { 
  Group as GroupIcon, 
  Person as PersonIcon, 
  SportsTennis as SportsIcon,
  Handshake as HandshakeIcon,
  SupervisorAccount as SupervisorAccountIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Define types for API responses
interface Tournament {
  id: string;
  name: string;
  is_active: boolean;
  description?: string;
}

export default function PublicHomePage() {
  const theme = useTheme();
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    players: 0,
    teams: 0,
    formats: 0
  });

  // Fetch active tournament
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await fetch('/api/public/tournaments');
        if (!response.ok) {
          throw new Error('Failed to fetch tournaments');
        }
        const data = await response.json();
        
        // Find active tournament
        const active = data.currentTournament || (data.tournaments.length > 0 ? data.tournaments[0] : null);
        setActiveTournament(active);
        
        // Fetch stats
        if (active) {
          // Fetch player count
          const playersResponse = await fetch('/api/public/players?tournamentId=' + active.id);
          if (playersResponse.ok) {
            const playersData = await playersResponse.json();
            setStats(prev => ({ ...prev, players: playersData.data?.length || 0 }));
          }
          
          // Fetch team count
          const teamsResponse = await fetch('/api/public/team-compositions?tournamentId=' + active.id);
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setStats(prev => ({ ...prev, teams: teamsData.data?.length || 0 }));
          }
          
          // Fetch format count
          const formatsResponse = await fetch(`/api/public/tournaments/${active.id}/formats`);
          if (formatsResponse.ok) {
            const formatsData = await formatsResponse.json();
            setStats(prev => ({ ...prev, formats: formatsData.data?.length || 0 }));
          }
        }
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        setError('Failed to load tournament information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, []);

  // Navigation cards data
  const navCards = [
    {
      title: 'Players',
      description: 'Browse all registered players, their skills, and statistics',
      icon: <PersonIcon fontSize="large" />,
      path: '/players',
      color: theme.palette.primary.main
    },
    {
      title: 'Teams',
      description: 'Explore teams, their rosters, and performance',
      icon: <GroupIcon fontSize="large" />,
      path: '/teams',
      color: theme.palette.secondary.main
    },
    {
      title: 'Tournament Formats',
      description: 'Learn about different tournament formats and rules',
      icon: <SportsIcon fontSize="large" />,
      path: '/formats',
      color: theme.palette.success.main
    },
    {
      title: 'Sponsors',
      description: 'View our sponsors who make this tournament possible',
      icon: <HandshakeIcon fontSize="large" />,
      path: '/sponsors',
      color: theme.palette.warning.main
    },
    {
      title: 'Organizers',
      description: 'Meet the team behind the tournament',
      icon: <SupervisorAccountIcon fontSize="large" />,
      path: '/organizers',
      color: theme.palette.info.main
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          mb: 6
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              color: theme.palette.primary.main,
              textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            PBEL City Volleyball
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.5rem' }
            }}
          >
            {loading ? (
              <Skeleton width="100%" />
            ) : activeTournament ? (
              activeTournament.description || 'Welcome to the official tournament page. Explore teams, players, and more!'
            ) : (
              'Welcome to the official volleyball tournament page. Explore teams, players, and more!'
            )}
          </Typography>
        </motion.div>
        
        {/* Tournament Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Grid 
            container 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Grid item xs={12} sm={4} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <PersonIcon 
                  color="primary" 
                  sx={{ fontSize: 40, mb: 1 }} 
                />
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {loading ? <Skeleton width="100%" /> : stats.players}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Players
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <GroupIcon 
                  color="secondary" 
                  sx={{ fontSize: 40, mb: 1 }} 
                />
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {loading ? <Skeleton width="100%" /> : stats.teams}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Teams
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  borderRadius: 2,
                  height: '100%'
                }}
              >
                <SportsIcon 
                  sx={{ fontSize: 40, mb: 1, color: theme.palette.success.main }} 
                />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {loading ? <Skeleton width="100%" /> : stats.formats}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Formats
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
      
      {/* Navigation Cards */}
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom
        sx={{ 
          fontWeight: 700,
          mb: 4,
          textAlign: 'center'
        }}
      >
        Explore the Tournament
      </Typography>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {navCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <motion.div variants={itemVariants}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10],
                    }
                  }}
                >
                  <CardActionArea 
                    component={Link}
                    href={card.path}
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box 
                      sx={{ 
                        p: 3, 
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: alpha(card.color, 0.1),
                        color: card.color
                      }}
                    >
                      {card.icon}
                      <Typography variant="h5" component="h3" sx={{ ml: 2, fontWeight: 'bold' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" color="text.secondary">
                        {card.description}
                      </Typography>
                    </CardContent>
                    <Box 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <Typography 
                        variant="button" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: card.color,
                          fontWeight: 'medium'
                        }}
                      >
                        View {card.title}
                        <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
      
      {/* Current Tournament Section */}
      <Box sx={{ mb: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                {loading ? (
                  <Skeleton width="80%" />
                ) : activeTournament ? (
                  `${activeTournament.name}`
                ) : (
                  'Current Tournament'
                )}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {loading ? (
                  <>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton width="80%" />
                  </>
                ) : (
                  'Join us for an exciting volleyball tournament featuring talented players and competitive teams. Experience the thrill of the game, witness amazing skills, and enjoy the spirit of sportsmanship.'
                )}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  component={Link}
                  href="/teams"
                  startIcon={<GroupIcon />}
                >
                  View Teams
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  component={Link}
                  href="/players"
                  startIcon={<PersonIcon />}
                >
                  Browse Players
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative',
                  height: { xs: '250px', md: '300px' },
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: theme.shadows[5]
                }}
              >
                <Image 
                  src="/volleyball-court.jpg" 
                  alt="Volleyball Tournament" 
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
} 