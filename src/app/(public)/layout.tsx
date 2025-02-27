'use client'

import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material'
import { SportsVolleyball as VolleyballIcon } from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  return (
    <>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VolleyballIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Tournament Auction
                </Typography>
              </Box>
              
              <Box>
                <Button 
                  component={Link} 
                  href="/players"
                  color="inherit"
                  sx={{ 
                    fontWeight: pathname === '/players' ? 'bold' : 'normal',
                    borderBottom: pathname === '/players' ? '2px solid white' : 'none',
                    borderRadius: 0,
                    mx: 1
                  }}
                >
                  Players
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
          py: 4
        }}
      >
        {children}
      </Box>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Tournament Auction App. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  )
} 