'use client'

import { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Header } from '../Header'
import { Sidebar } from '../Sidebar'

const DRAWER_WIDTH = 120;

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden', width: '100vw', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          overflow: 'auto',
          p: { xs: 1, sm: 1.5 },
          ml: isSidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: theme => theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
} 