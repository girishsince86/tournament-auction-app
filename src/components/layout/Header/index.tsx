'use client'

import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { UserMenu } from './UserMenu'

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
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Tournament Auction App
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  )
} 