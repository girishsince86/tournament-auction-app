'use client';

import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  useTheme, 
  alpha, 
  Divider,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Link as MuiLink,
  Zoom,
  Fade,
  Grow,
  keyframes
} from '@mui/material';
import { 
  Handshake as HandshakeIcon,
  OpenInNew as OpenInNewIcon,
  SportsVolleyball as VolleyballIcon
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Define animations
const float = keyframes`
  0% { transform: translateY(-10px) rotate(0deg); }
  50% { transform: translateY(10px) rotate(5deg); }
  100% { transform: translateY(-10px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Sponsor data structure
interface Sponsor {
  id: string;
  name: string;
  logoPath: string;
  website: string;
  description: string;
  sponsorshipLevel: 'presenting' | 'powered' | 'supporting';
  order: number;
}

// Sample sponsor data
const sponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Ask Trice',
    logoPath: '/images/sponsors/ask-trice-logo.png',
    website: 'https://apps.apple.com/in/app/trice-your-neighbourhood-app/id1383696181',
    description: 'Trice is a unique Neighbourhood app built by the residents for the residents of Apartment Communities. It connects you with home chefs, local vendors offering free home delivery for groceries and fresh produce, and provides a personal assistant service called Trice Buddy to help with tasks. The app features natural & organic groceries, vegan & eco products, and same-day delivery from local favorites. As the presenting sponsor of the PBEL CIty Volleyball & Throwball League 2025, Trice is committed to promoting community engagement.',
    sponsorshipLevel: 'presenting',
    order: 1
  },
  {
    id: '2',
    name: 'Indis',
    logoPath: '/images/sponsors/indis-logo.png',
    website: 'https://indis.co.in/',
    description: 'Indis is a premier real estate developer known for creating sustainable and modern living spaces. As a powered by sponsor, Indis brings its commitment to excellence and community building to the PBEL CIty Volleyball & Throwball League 2025.',
    sponsorshipLevel: 'powered',
    order: 2
  },
  {
    id: '3',
    name: 'Creekside Farm Resort',
    logoPath: '/images/sponsors/creekside-farm-resort-logo.png',
    website: 'https://www.instagram.com/creeksidefarmresortvikarabad/',
    description: 'Creekside Farm Resort offers a serene retreat amidst nature with world-class amenities and hospitality. As a supporting sponsor, Creekside Farm Resort helps create memorable experiences for players and fans of the PBEL CIty Volleyball & Throwball League 2025.',
    sponsorshipLevel: 'supporting',
    order: 3
  }
];

// Volleyball decoration component
const VolleyballDecoration = ({ position, delay, size }: { 
  position: { [key: string]: string }, 
  delay: number, 
  size: number 
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 0,
        ...position,
        opacity: 0.7,
        filter: 'blur(1px)',
        animation: `${float} 8s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      <VolleyballIcon sx={{ fontSize: size, color: alpha('#000', 0.1) }} />
    </Box>
  );
};

export default function SponsorsPage() {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Group sponsors by level
  const presentingSponsors = sponsors.filter(s => s.sponsorshipLevel === 'presenting');
  const poweredBySponsors = sponsors.filter(s => s.sponsorshipLevel === 'powered');
  const supportingSponsors = sponsors.filter(s => s.sponsorshipLevel === 'supporting');
  
  return (
    <Container maxWidth="xl">
      {/* Decorative volleyballs */}
      <VolleyballDecoration position={{ top: '10%', left: '5%' }} delay={0} size={60} />
      <VolleyballDecoration position={{ top: '30%', right: '8%' }} delay={2} size={40} />
      <VolleyballDecoration position={{ bottom: '20%', left: '10%' }} delay={4} size={50} />
      <VolleyballDecoration position={{ bottom: '40%', right: '5%' }} delay={1} size={45} />
      
      <Fade in={isLoaded} timeout={1000}>
        <Box sx={{ 
          mb: 4,
          textAlign: 'center',
          position: 'relative',
          py: 2
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            Our Sponsors
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              mb: 2,
              fontWeight: 400
            }}
          >
            Meet the organizations that make the PBEL CIty Volleyball & Throwball League possible
          </Typography>
          <Divider sx={{ width: '100px', mx: 'auto', mb: 3, borderColor: theme.palette.primary.main }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <HandshakeIcon />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {sponsors.length} Valued Partners
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
      
      {/* Presenting Sponsors Section */}
      {presentingSponsors.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Grow in={isLoaded} timeout={1000} style={{ transformOrigin: '0 0 0' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.05)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontWeight: 600,
                  textAlign: 'center',
                  color: theme.palette.primary.main
                }}
              >
                Presenting Sponsors
              </Typography>
            </Paper>
          </Grow>
          
          <Grid container spacing={4} justifyContent="center">
            {presentingSponsors.map((sponsor, index) => (
              <Grid item xs={12} sx={{ maxWidth: '1000px' }} key={sponsor.id}>
                <Fade in={isLoaded} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      overflow: 'hidden',
                      borderRadius: 3,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px) scale(1.02)',
                        boxShadow: theme.shadows[10]
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: { xs: '100%', md: '30%' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                        bgcolor: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                          zIndex: 0
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          width: '100%',
                          height: 200,
                          maxWidth: 300,
                          zIndex: 1,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05) rotate(2deg)'
                          }
                        }}
                      >
                        <Image
                          src={sponsor.logoPath}
                          alt={sponsor.name}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '70%' } }}>
                      <CardContent sx={{ flexGrow: 1, p: 4 }}>
                        <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                          {sponsor.name}
                        </Typography>
                        {sponsor.id === '1' && (
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              mb: 2, 
                              fontStyle: 'italic', 
                              color: theme.palette.primary.main,
                              fontWeight: 500
                            }}
                          >
                            "Get Anything & Everything Done. Just ask us"
                          </Typography>
                        )}
                        <Typography variant="body1" color="text.secondary" paragraph>
                          {sponsor.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button 
                          component={MuiLink}
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="contained"
                          color="primary"
                          endIcon={<OpenInNewIcon />}
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            },
                            '&:active': {
                              transform: 'scale(0.95)'
                            }
                          }}
                        >
                          Visit Website
                        </Button>
                      </CardActions>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Powered By Sponsors Section */}
      {poweredBySponsors.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Grow in={isLoaded} timeout={1000} style={{ transformOrigin: '0 0 0', transitionDelay: '200ms' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              }}
            >
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontWeight: 600,
                  textAlign: 'center',
                  color: theme.palette.secondary.main
                }}
              >
                Powered By
              </Typography>
            </Paper>
          </Grow>
          
          <Grid container spacing={4} justifyContent="center">
            {poweredBySponsors.map((sponsor, index) => (
              <Grid item xs={12} sm={10} md={8} lg={6} key={sponsor.id}>
                <Fade in={isLoaded} timeout={1000} style={{ transitionDelay: `${300 + index * 200}ms` }}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px) scale(1.03)',
                        boxShadow: theme.shadows[10]
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
                          zIndex: 0
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          width: '100%',
                          height: 150,
                          zIndex: 1,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05) rotate(1deg)'
                          }
                        }}
                      >
                        <Image
                          src={sponsor.logoPath}
                          alt={sponsor.name}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {sponsor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sponsor.description}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button 
                        component={MuiLink}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="secondary"
                        endIcon={<OpenInNewIcon />}
                        sx={{ 
                          borderRadius: 2,
                          px: 2,
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          },
                          '&:active': {
                            transform: 'scale(0.95)'
                          }
                        }}
                      >
                        Visit Website
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Supporting Sponsors Section */}
      {supportingSponsors.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Grow in={isLoaded} timeout={1000} style={{ transformOrigin: '0 0 0', transitionDelay: '400ms' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.05)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              }}
            >
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontWeight: 600,
                  textAlign: 'center',
                  color: theme.palette.success.main
                }}
              >
                Supporting Sponsors
              </Typography>
            </Paper>
          </Grow>
          
          <Grid container spacing={3} justifyContent="center">
            {supportingSponsors.map((sponsor, index) => (
              <Grid item xs={12} sm={10} md={6} lg={4} key={sponsor.id}>
                <Fade in={isLoaded} timeout={1000} style={{ transitionDelay: `${500 + index * 200}ms` }}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px) scale(1.05)',
                        boxShadow: theme.shadows[10]
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3,
                        bgcolor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.05)} 0%, transparent 70%)`,
                          zIndex: 0
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          width: '100%',
                          height: 120,
                          zIndex: 1,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05) rotate(1deg)'
                          }
                        }}
                      >
                        <Image
                          src={sponsor.logoPath}
                          alt={sponsor.name}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {sponsor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sponsor.description}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button 
                        component={MuiLink}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="success"
                        endIcon={<OpenInNewIcon />}
                        sx={{ 
                          borderRadius: 2,
                          px: 2,
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          },
                          '&:active': {
                            transform: 'scale(0.95)'
                          }
                        }}
                      >
                        Visit Website
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      <Fade in={isLoaded} timeout={1000} style={{ transitionDelay: '800ms' }}>
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 6, 
            mb: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(/volleyball-pattern.svg)',
                backgroundSize: '200px 200px',
                backgroundPosition: 'center',
                opacity: 0.05,
                zIndex: 0
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Interested in Sponsoring?
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 700, mx: 'auto' }}>
                Join our growing family of sponsors and connect your brand with the excitement of the PBEL CIty Volleyball & Throwball League 2025. Contact the PCVC Organizers team to learn about sponsorship opportunities.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1,
                mt: 2
              }}>
                <HandshakeIcon color="primary" />
                <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 500 }}>
                  Contact PCVC Organizers Team
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
} 