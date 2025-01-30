'use client'

import { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Header } from '../Header'
import { Sidebar } from '../Sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${240}px)` },
        }}
      >
        <Toolbar /> {/* This creates space for the header */}
        {children}
      </Box>
    </Box>
  )
} 