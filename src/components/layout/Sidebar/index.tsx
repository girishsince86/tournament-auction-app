'use client'

import { useState, useMemo, useEffect } from 'react';
import { Drawer, List, Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import GavelIcon from '@mui/icons-material/Gavel'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import CategoryIcon from '@mui/icons-material/Category'
import StarIcon from '@mui/icons-material/Star'
import { SidebarItem } from './SidebarItem'
import { useAuth } from '@/features/auth/context/auth-context'
import { useTournaments } from '@/hooks/useTournaments'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const DRAWER_WIDTH = 120

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Get navigation items based on user role
const getNavigationItems = async (supabase: any, userEmail: string | undefined, currentTournament: any) => {
  // Define known admin emails (these will have full admin access)
  const adminEmails = [
    'gk@pbel.in', // Super admin
    'admin@pbel.in',  // Admin
    'amit@pbel.in',   // Admin
    'vasu@pbel.in'    // Admin
  ]; // Add all admin emails here

  // Define explicit list of team owner emails
  const teamOwnerEmails = [
    'naveen@pbel.in',
    'anish@pbel.in',
    'subhamitra@pbel.in',
    'raju@pbel.in',
    'saravana@pbel.in',
    'praveenraj@pbel.in',
    'romesh@pbel.in',
    'srinivas@pbel.in',
    'sraveen@pbel.in',
    'girish@pbel.in'  // Demo team owner
  ];

  // Check if user is a full admin (not just a team owner with pbel.in email)
  const isFullAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  // Check if user is a team owner (using explicit list)
  const isTeamOwner = userEmail ? teamOwnerEmails.includes(userEmail) : false;

  // Base items for all authenticated users
  const items = [
    {
      text: 'Auction Players',
      icon: <SportsVolleyballIcon />,
      href: '/players'
    },
    {
      text: 'Registration Summary',
      icon: <DashboardIcon />,
      href: '/registration-summary'
    }
  ];

  // Add My Profile and Team Management for team owners
  if (isTeamOwner) {
    items.push({
      text: 'My Profile',
      icon: <PersonIcon />,
      href: '/team-owner/profile'
    });

    // Fetch team ID for team owner
    if (userEmail) {
      const { data: teamOwner } = await supabase
        .from('team_owners')
        .select('team_id')
        .eq('email', userEmail)
        .single();

      if (teamOwner?.team_id) {
        // Add team management for team owners
        items.push({
          text: 'Team Management',
          icon: <GroupsIcon />,
          href: `/teams/${teamOwner.team_id}/management`
        });
      }
    }
  }

  // Additional items for admin users only
  if (isFullAdmin) {
    items.push(
      {
        text: 'Manage Registrations',
        icon: <ManageSearchIcon />,
        href: '/admin/manage-registrations'
      },
      {
        text: 'Auction Consent',
        icon: <GavelIcon />,
        href: '/admin/consent'
      }
      // {
      //   text: 'Manage Players',
      //   icon: <SportsVolleyballIcon />,
      //   href: '/manage-players'
      // },
      // {
      //   text: 'Player Categories',
      //   icon: <CategoryIcon />,
      //   href: '/admin/player-categories'
      // },
      // {
      //   text: 'Team Owner Profiles',
      //   icon: <PersonIcon />,
      //   href: '/team-owner/profile'
      // },
      // {
      //   text: 'Auction Control',
      //   icon: <GavelIcon />,
      //   href: currentTournament ? `/auction/${currentTournament.id}/control` : '/admin/auction'
      // },
      // {
      //   text: 'Team Budgets',
      //   icon: <AccountBalanceWalletIcon />,
      //   href: '/admin/team-budgets'
      // },
      // {
      //   text: 'Team Management',
      //   icon: <GroupsIcon />,
      //   href: '/admin/teams'
      // }
    );
  }

  return items;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const { currentTournament } = useTournaments()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const supabase = createClientComponentClient()
  const [navigationItems, setNavigationItems] = useState<any[]>([])

  useEffect(() => {
    const loadNavigationItems = async () => {
      const items = await getNavigationItems(supabase, user?.email, currentTournament)
      setNavigationItems(items)
    }
    loadNavigationItems()
  }, [user?.email, currentTournament, supabase])

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