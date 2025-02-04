'use client'

import { Drawer, List, Box, Toolbar } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupsIcon from '@mui/icons-material/Groups'
import PeopleIcon from '@mui/icons-material/People'
import GavelIcon from '@mui/icons-material/Gavel'
import { SidebarItem } from './SidebarItem'

const DRAWER_WIDTH = 240

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { text: 'Leagues', icon: <EmojiEventsIcon />, href: '/tournaments' },
  { text: 'Teams', icon: <GroupsIcon />, href: '/teams' },
  { text: 'Players', icon: <PeopleIcon />, href: '/players' },
  { text: 'Auctions', icon: <GavelIcon />, href: '/auctions' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
      open={isOpen}
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
            />
          ))}
        </List>
      </Box>
    </Drawer>
  )
} 