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
      {/* Hero Section - sports broadcast style */}
      <Box 
        sx={{ 
          position: 'relative',
          zIndex: 1,
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          mb: 6
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#fff',
              textShadow: '0 0 32px rgba(14, 165, 233, 0.25)',
              fontSize: { xs: '2.5rem', md: '4rem' }
            }}
          >
            PBEL City Volleyball
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
          <Typography 
            variant="h5"
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {loading ? (
              <Skeleton width="100%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            ) : activeTournament ? (
              activeTournament.description || 'Welcome to the official tournament page. Explore teams, players, and more!'
            ) : (
              'Welcome to the official volleyball tournament page. Explore teams, players, and more!'
            )}
          </Typography>
        </motion.div>
        
        {/* Tournament Stats - scoreboard style cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.33, 1, 0.68, 1] }}
        >
          <Grid 
            container 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            {[
              { value: stats.players, label: 'Players', icon: <PersonIcon sx={{ fontSize: 36 }} />, accent: '#0ea5e9' },
              { value: stats.teams, label: 'Teams', icon: <GroupIcon sx={{ fontSize: 36 }} />, accent: '#f97316' },
              { value: stats.formats, label: 'Formats', icon: <SportsIcon sx={{ fontSize: 36 }} />, accent: '#22c55e' },
            ].map((stat, i) => (
              <Grid item xs={12} sm={4} md={3} key={stat.label}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(26, 34, 52, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 2,
                    height: '100%',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(14, 165, 233, 0.12)',
                    },
                  }}
                >
                  <Box sx={{ color: stat.accent, mb: 1 }}>{stat.icon}</Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {loading ? <Skeleton width={48} sx={{ mx: 'auto', bgcolor: 'rgba(255,255,255,0.1)' }} /> : stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
      
      {/* Navigation Cards - sports card style */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="overline" 
          component="h2"
          sx={{ 
            display: 'block',
            fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem',
          }}
        >
          Explore the Tournament
        </Typography>
        <Box 
          sx={{ 
            height: 4, 
            width: 48, 
            mx: 'auto', 
            mt: 1, 
            borderRadius: 2, 
            background: 'linear-gradient(90deg, #0ea5e9, #f97316)' 
          }} 
        />
      </Box>
      
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
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(180deg, rgba(26, 34, 52, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 2,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(14, 165, 233, 0.15)',
                    },
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
                        bgcolor: alpha(card.color, 0.12),
                        color: card.color
                      }}
                    >
                      {card.icon}
                      <Typography variant="h5" component="h3" sx={{ ml: 2, fontWeight: 'bold' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {card.description}
                      </Typography>
                    </CardContent>
                    <Box 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Typography 
                        variant="button" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: card.color,
                          fontWeight: 600,
                          fontSize: '0.8rem',
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
      
      {/* Current Tournament Section - sports card */}
      <Box sx={{ mb: 8, position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(26, 34, 52, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: '#fff',
                  fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                }}
              >
                {loading ? (
                  <Skeleton width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                ) : activeTournament ? (
                  `${activeTournament.name}`
                ) : (
                  'Current Tournament'
                )}
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ color: 'rgba(255,255,255,0.85)' }}>
                {loading ? (
                  <>
                    <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Skeleton width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
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
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
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