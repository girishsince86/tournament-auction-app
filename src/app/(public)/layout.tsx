'use client'

import { Box, AppBar, Toolbar, Typography, Button, Container, useTheme, alpha, Divider, Paper, useMediaQuery, IconButton, Tooltip, Fade } from '@mui/material'
import { SportsVolleyball as VolleyballIcon, Groups as GroupsIcon, Person as PersonIcon, Handshake as HandshakeIcon, SupervisorAccount as SupervisorAccountIcon, Instagram as InstagramIcon, Facebook as FacebookIcon, Twitter as TwitterIcon } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PublicNavigation } from '@/components/public/PublicNavigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <>
      <AppBar 
        position="sticky" 
        color="primary" 
        elevation={4}
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          backdropFilter: 'blur(8px)',
          zIndex: 1100
        }}
      >
        <Toolbar>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                component={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box 
                  sx={{ 
                    position: 'relative', 
                    width: 45, 
                    height: 45, 
                    mr: 2,
                    animation: 'pulse 3s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                      },
                      '50%': {
                        transform: 'scale(1.05)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                      },
                    },
                  }}
                >
                  <Image 
                    src="/pbel-volleyball-logo.png" 
                    alt="PBL Volleyball Logo" 
                    width={45} 
                    height={45}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      flexGrow: 1,
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
                      lineHeight: 1.2,
                      fontSize: { xs: '1.1rem', sm: '1.5rem' }
                    }}
                  >
                    PBEL CIty Volleyball
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: alpha(theme.palette.common.white, 0.9),
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                    }}
                  >
                    & Throwball League 2025
                  </Typography>
                </Box>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 0.5, sm: 1 },
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  }
                }}
                component={motion.div}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button 
                  component={Link} 
                  href="/players"
                  color="inherit"
                  startIcon={!isMobile && <PersonIcon />}
                  sx={{ 
                    fontWeight: pathname === '/players' ? 'bold' : 'normal',
                    borderBottom: pathname === '/players' ? '3px solid white' : 'none',
                    borderRadius: pathname === '/players' ? '0' : '20px',
                    mx: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    },
                    '&::after': pathname === '/players' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                      animation: 'shimmer 2s infinite',
                      '@keyframes shimmer': {
                        '0%': {
                          backgroundPosition: '0% 50%',
                        },
                        '50%': {
                          backgroundPosition: '100% 50%',
                        },
                        '100%': {
                          backgroundPosition: '0% 50%',
                        },
                      },
                    } : {}
                  }}
                >
                  {isMobile ? <PersonIcon fontSize="small" /> : "Players"}
                </Button>
                
                <Button 
                  component={Link} 
                  href="/teams"
                  color="inherit"
                  startIcon={!isMobile && <GroupsIcon />}
                  sx={{ 
                    fontWeight: pathname === '/teams' ? 'bold' : 'normal',
                    borderBottom: pathname === '/teams' ? '3px solid white' : 'none',
                    borderRadius: pathname === '/teams' ? '0' : '20px',
                    mx: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    },
                    '&::after': pathname === '/teams' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                      animation: 'shimmer 2s infinite',
                      '@keyframes shimmer': {
                        '0%': {
                          backgroundPosition: '0% 50%',
                        },
                        '50%': {
                          backgroundPosition: '100% 50%',
                        },
                        '100%': {
                          backgroundPosition: '0% 50%',
                        },
                      },
                    } : {}
                  }}
                >
                  {isMobile ? <GroupsIcon fontSize="small" /> : "Teams"}
                </Button>
                
                <Button 
                  component={Link} 
                  href="/team-owners"
                  color="inherit"
                  startIcon={!isMobile && <GroupsIcon />}
                  sx={{ 
                    fontWeight: pathname === '/team-owners' ? 'bold' : 'normal',
                    borderBottom: pathname === '/team-owners' ? '3px solid white' : 'none',
                    borderRadius: pathname === '/team-owners' ? '0' : '20px',
                    mx: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    },
                    '&::after': pathname === '/team-owners' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                      animation: 'shimmer 2s infinite',
                      '@keyframes shimmer': {
                        '0%': {
                          backgroundPosition: '0% 50%',
                        },
                        '50%': {
                          backgroundPosition: '100% 50%',
                        },
                        '100%': {
                          backgroundPosition: '0% 50%',
                        },
                      },
                    } : {}
                  }}
                >
                  {isMobile ? <GroupsIcon fontSize="small" /> : "Team Owners"}
                </Button>
                
                <Button 
                  component={Link} 
                  href="/organizers"
                  color="inherit"
                  startIcon={!isMobile && <SupervisorAccountIcon />}
                  sx={{ 
                    fontWeight: pathname === '/organizers' ? 'bold' : 'normal',
                    borderBottom: pathname === '/organizers' ? '3px solid white' : 'none',
                    borderRadius: pathname === '/organizers' ? '0' : '20px',
                    mx: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    },
                    '&::after': pathname === '/organizers' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                      animation: 'shimmer 2s infinite',
                      '@keyframes shimmer': {
                        '0%': {
                          backgroundPosition: '0% 50%',
                        },
                        '50%': {
                          backgroundPosition: '100% 50%',
                        },
                        '100%': {
                          backgroundPosition: '0% 50%',
                        },
                      },
                    } : {}
                  }}
                >
                  {isMobile ? <SupervisorAccountIcon fontSize="small" /> : "Organizers"}
                </Button>
                
                <Button 
                  component={Link} 
                  href="/sponsors"
                  color="inherit"
                  startIcon={!isMobile && <HandshakeIcon />}
                  sx={{ 
                    fontWeight: pathname === '/sponsors' ? 'bold' : 'normal',
                    borderBottom: pathname === '/sponsors' ? '3px solid white' : 'none',
                    borderRadius: pathname === '/sponsors' ? '0' : '20px',
                    mx: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    },
                    '&::after': pathname === '/sponsors' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '3px',
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                      animation: 'shimmer 2s infinite',
                      '@keyframes shimmer': {
                        '0%': {
                          backgroundPosition: '0% 50%',
                        },
                        '50%': {
                          backgroundPosition: '100% 50%',
                        },
                        '100%': {
                          backgroundPosition: '0% 50%',
                        },
                      },
                    } : {}
                  }}
                >
                  {isMobile ? <HandshakeIcon fontSize="small" /> : "Sponsors"}
                </Button>
              </Box>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{
          minHeight: 'calc(100vh - 64px)', // Subtract the AppBar height
          bgcolor: 'background.default',
          py: 6,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '250px',
            background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.08)}, transparent)`,
            zIndex: 0
          }
        }}
      >
        {children}
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 6, 
          bgcolor: theme.palette.grey[100],
          borderTop: 1, 
          borderColor: 'divider',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative', width: 60, height: 60 }}>
                <Image 
                  src="/pbel-volleyball-logo.png" 
                  alt="PBL Volleyball Logo" 
                  width={60} 
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  PBEL CIty Volleyball
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  & Throwball League 2025
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/players"
                color="primary"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Players
              </Button>
              <Button
                component={Link}
                href="/team-owners"
                color="primary"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Team Owners
              </Button>
              <Button
                component={Link}
                href="/organizers"
                color="primary"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Organizers
              </Button>
              <Button
                component={Link}
                href="/sponsors"
                color="primary"
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Sponsors
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Instagram">
                <IconButton color="primary" size="small" sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <InstagramIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Facebook">
                <IconButton color="primary" size="small" sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <FacebookIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Twitter">
                <IconButton color="primary" size="small" sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <TwitterIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Divider sx={{ width: '100%', mb: 2 }} />
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ fontWeight: 500 }}
            >
              © {new Date().getFullYear()} PBEL CIty Volleyball & Throwball League. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  )
} 