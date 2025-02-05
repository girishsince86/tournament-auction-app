'use client'

import { Drawer, List, Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { SidebarItem } from './SidebarItem'

const DRAWER_WIDTH = 240

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Only show Dashboard and Registrations in both environments
const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/admin' },
  { text: 'Registrations', icon: <HowToRegIcon />, href: '/admin/registrations' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={isOpen}
      onClose={onClose}
      sx={{
        width: isOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
    >
      <Toolbar /> {/* This creates space for the header */}
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.text}
              icon={item.icon}
              text={item.text}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  )
} 