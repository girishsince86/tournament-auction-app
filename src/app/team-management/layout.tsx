'use client'

import { ReactNode } from 'react'
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Divider,
} from '@mui/material'
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'

const navigationItems = [
  {
    label: 'Teams',
    path: '/team-management/teams',
    icon: PeopleIcon,
  },
  {
    label: 'Owner Profile',
    path: '/team-management/owner-profile',
    icon: PersonIcon,
  },
  {
    label: 'Settings',
    path: '/team-management/settings',
    icon: SettingsIcon,
  },
]

export default function TeamManagementLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // If we're at the root team-management path, redirect to teams
  if (pathname === '/team-management') {
    router.push('/team-management/teams')
    return null
  }

  const currentTab = navigationItems.findIndex(item => 
    pathname === item.path || pathname?.startsWith(`${item.path}/`)
  )

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    router.push(navigationItems[newValue].path)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Management
        </Typography>
        <Paper elevation={0}>
          <Tabs
            value={currentTab !== -1 ? currentTab : 0}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 48,
              },
            }}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Tab
                  key={item.path}
                  icon={<Icon />}
                  label={item.label}
                  iconPosition="start"
                  sx={{
                    minHeight: 48,
                    textTransform: 'none',
                  }}
                />
              )
            })}
          </Tabs>
        </Paper>
      </Box>
      {children}
    </Container>
  )
} 