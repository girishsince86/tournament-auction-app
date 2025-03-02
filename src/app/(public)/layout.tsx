'use client'

import { Box, AppBar, Toolbar, Typography, Button, Container, useTheme, alpha, Divider } from '@mui/material'
import { SportsVolleyball as VolleyballIcon, Groups as GroupsIcon, Person as PersonIcon, Handshake as HandshakeIcon } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const theme = useTheme();
  
  return (
    <>
      <AppBar 
        position="static" 
        color="primary" 
        elevation={0}
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
        }}
      >
        <Toolbar>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', width: 40, height: 40, mr: 2 }}>
                  <Image 
                    src="/pbel-volleyball-logo.png" 
                    alt="PBL Volleyball Logo" 
                    width={40} 
                    height={40}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      flexGrow: 1,
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
                      lineHeight: 1.2
                    }}
                  >
                    PBEL CIty Volleyball
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: alpha(theme.palette.common.white, 0.9),
                      fontWeight: 500,
                      letterSpacing: '0.5px'
                    }}
                  >
                    & Throwball League 2025
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  component={Link} 
                  href="/players"
                  color="inherit"
                  startIcon={<PersonIcon />}
                  sx={{ 
                    fontWeight: pathname === '/players' ? 'bold' : 'normal',
                    borderBottom: pathname === '/players' ? '2px solid white' : 'none',
                    borderRadius: pathname === '/players' ? '0' : '20px',
                    mx: 1,
                    px: 2,
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Players
                </Button>
                
                <Button 
                  component={Link} 
                  href="/team-owners"
                  color="inherit"
                  startIcon={<GroupsIcon />}
                  sx={{ 
                    fontWeight: pathname === '/team-owners' ? 'bold' : 'normal',
                    borderBottom: pathname === '/team-owners' ? '2px solid white' : 'none',
                    borderRadius: pathname === '/team-owners' ? '0' : '20px',
                    mx: 1,
                    px: 2,
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Team Owners
                </Button>
                
                <Button 
                  component={Link} 
                  href="/sponsors"
                  color="inherit"
                  startIcon={<HandshakeIcon />}
                  sx={{ 
                    fontWeight: pathname === '/sponsors' ? 'bold' : 'normal',
                    borderBottom: pathname === '/sponsors' ? '2px solid white' : 'none',
                    borderRadius: pathname === '/sponsors' ? '0' : '20px',
                    mx: 1,
                    px: 2,
                    py: 0.8,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Sponsors
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
            height: '200px',
            background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
            zIndex: 0
          }
        }}
      >
        {children}
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Divider sx={{ width: '100%', mb: 2 }} />
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ fontWeight: 500 }}
            >
              © {new Date().getFullYear()} PBEL CIty Volleyball & Throwball League. All rights reserved.
            </Typography>
            
            <Button
              component={Link}
              href="/sponsors"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            >
              View Our Sponsors
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  )
} 