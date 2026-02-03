'use client'

import { Box, AppBar, Toolbar, Typography, Button, Container, useTheme, alpha, Divider, Paper, useMediaQuery, IconButton, Tooltip, Fade } from '@mui/material'
import { SportsVolleyball as VolleyballIcon, Groups as GroupsIcon, Person as PersonIcon, Handshake as HandshakeIcon, SupervisorAccount as SupervisorAccountIcon, Instagram as InstagramIcon, Facebook as FacebookIcon, YouTube as YouTubeIcon } from '@mui/icons-material'
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
        elevation={0}
        sx={{
          background: 'linear-gradient(180deg, #0a0e17 0%, #1a2234 100%)',
          borderBottom: '4px solid transparent',
          borderImage: 'linear-gradient(90deg, #0ea5e9, #f97316) 1',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          zIndex: 1100,
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
                    style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      flexGrow: 1,
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textShadow: '0 0 24px rgba(14, 165, 233, 0.2)',
                      lineHeight: 1.2,
                      fontSize: { xs: '1.1rem', sm: '1.5rem' },
                      color: '#fff',
                    }}
                  >
                    PBEL City Volleyball
                  </Typography>
                  <Typography 
                    component="div"
                    sx={{ 
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: alpha(theme.palette.common.white, 0.9),
                      lineHeight: 1.2,
                      fontSize: { xs: '1.1rem', sm: '1.5rem' },
                    }}
                  >
                    & Throwball League 2026
                  </Typography>
                </Box>
              </Box>
              
              <Box 
                sx={{ display: 'none' }}
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
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(180deg, #0f172a 0%, #0a0e17 30%, #111827 100%)',
          py: 6,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '320px',
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.15), transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        {children}
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 6, 
          background: 'linear-gradient(180deg, #111827 0%, #0a0e17 100%)',
          borderTop: '4px solid transparent',
          borderImage: 'linear-gradient(90deg, #0ea5e9, #f97316) 1',
          position: 'relative',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
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
                  style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sports-display), Oswald, sans-serif' }}>
                  PBEL City Volleyball
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em' }}>
                  & Throwball League 2026
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/organizers"
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 2, 
                  borderColor: 'rgba(14, 165, 233, 0.6)', 
                  color: '#38bdf8',
                  '&:hover': { borderColor: '#0ea5e9', bgcolor: 'rgba(14, 165, 233, 0.1)' },
                }}
              >
                Organizers
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Instagram">
                <IconButton
                  component="a"
                  href="https://instagram.com/pcvc2017"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    '&:hover': {
                      color: '#38bdf8',
                      borderColor: 'rgba(14, 165, 233, 0.5)',
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <InstagramIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="YouTube">
                <IconButton
                  component="a"
                  href="https://www.youtube.com/@PBELCITYVOLLEYBALLCLUB"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    '&:hover': {
                      color: '#38bdf8',
                      borderColor: 'rgba(14, 165, 233, 0.5)',
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <YouTubeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Facebook">
                <IconButton
                  component="a"
                  href="https://www.facebook.com/PBELCITYVBCLUB"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    '&:hover': {
                      color: '#38bdf8',
                      borderColor: 'rgba(14, 165, 233, 0.5)',
                      bgcolor: 'rgba(14, 165, 233, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  <FacebookIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Divider sx={{ width: '100%', mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            
            <Typography 
              variant="body2" 
              align="center"
              sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}
            >
              © {new Date().getFullYear()} PBEL City Volleyball & Throwball League. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  )
} 