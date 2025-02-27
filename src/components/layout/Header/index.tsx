'use client'

import { AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { UserMenu } from './UserMenu'
import Image from 'next/image'
import Link from 'next/link'
import { SportsVolleyball as VolleyballIcon } from '@mui/icons-material'

interface HeaderProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box 
          sx={{ 
            position: 'relative',
            width: 40,
            height: 40,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Image
            src="/images/pbel-volleyball-logo.png"
            alt="PBEL City Volleyball Club"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>

        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          League Auction App
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            href="/players"
            color="primary"
            startIcon={<VolleyballIcon />}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Players
          </Button>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  )
} 