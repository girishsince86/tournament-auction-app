'use client'

import { Drawer, List, Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import GavelIcon from '@mui/icons-material/Gavel'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import GroupsIcon from '@mui/icons-material/Groups'
import SettingsIcon from '@mui/icons-material/Settings'
import { SidebarItem } from './SidebarItem'
import { useAuth } from '@/features/auth/context/auth-context'
import { useTournaments } from '@/hooks/useTournaments'

const DRAWER_WIDTH = 120

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Get navigation items based on user role
const getNavigationItems = (isAdmin: boolean, teamId: string | null, currentTournament: any) => {
  // Base items for all authenticated users
  const items = [
    { 
      text: 'Registration Summary', 
      icon: <DashboardIcon />, 
      href: '/registration-summary' 
    },
    {
      text: 'Tournament Registration',
      icon: <SportsVolleyballIcon />,
      href: '/tournaments/register'
    }
  ]

  // Add team management if user has a team
  if (teamId && !isAdmin) {
    items.push({
      text: 'Team Management',
      icon: <GroupsIcon />,
      href: `/teams/${teamId}/management`
    })
  }

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
      },
      {
        text: 'Auction Control',
        icon: <GavelIcon />,
        href: currentTournament ? `/auction/${currentTournament.id}/control` : '/admin/auction'
      },
      {
        text: 'Team Budgets',
        icon: <AccountBalanceWalletIcon />,
        href: '/admin/team-budgets'
      },
      {
        text: 'Team Management',
        icon: <GroupsIcon />,
        href: '/admin/teams'
      }
    )
  }

  return items
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const { currentTournament } = useTournaments()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isAdmin = Boolean(user?.email?.endsWith('@pbel.in'))
  const teamId = user?.user_metadata?.team_id || null

  const navigationItems = getNavigationItems(isAdmin, teamId, currentTournament)

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: DRAWER_WIDTH,
          border: 'none',
          bgcolor: 'background.paper',
          position: 'fixed',
          height: '100%',
          zIndex: theme.zIndex.drawer,
          '& .MuiListItemText-root': {
            margin: 0,
            textAlign: 'center',
            '& span': {
              fontSize: '0.7rem',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: 1.1,
              display: 'block'
            }
          },
          '& .MuiListItemButton-root': {
            flexDirection: 'column',
            py: 1.5,
            px: 0.5,
            gap: 0.5,
            minHeight: 72,
            justifyContent: 'center'
          },
          '& .MuiListItemIcon-root': {
            minWidth: 'auto',
            marginRight: 0
          }
        }
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.href}
              text={item.text}
              icon={item.icon}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  )
} 