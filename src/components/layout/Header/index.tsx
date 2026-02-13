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
        background: 'linear-gradient(135deg, #0a0e17 0%, #1a2234 100%)',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #0ea5e9, #f97316)',
        },
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
            width: 48,
            height: 48,
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
            fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          Pbel City Volley Ball and Throw Ball 2026 League
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
