'use client'

import { Drawer, List, Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import { SidebarItem } from './SidebarItem'
import { useAuth } from '@/features/auth/context/auth-context'

const DRAWER_WIDTH = 240

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Get navigation items based on user role
const getNavigationItems = (isAdmin: boolean) => {
  // Base items for all authenticated users
  const items = [
    { 
      text: 'Registration Summary', 
      icon: <DashboardIcon />, 
      href: '/registration-summary' 
    },
  ]

  // Additional items for admin users
  if (isAdmin) {
    items.push(
      { 
        text: 'Manage Registrations', 
        icon: <ManageSearchIcon />, 
        href: '/admin/manage-registrations' 
      },
      {
        text: 'Volleyball Players',
        icon: <SportsVolleyballIcon />,
        href: '/admin/volleyball-players'
      }
    )
  }

  return items
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuth()
  const isAdmin = Boolean(user?.email?.endsWith('@pbel.in'))
  const navigationItems = getNavigationItems(isAdmin)

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