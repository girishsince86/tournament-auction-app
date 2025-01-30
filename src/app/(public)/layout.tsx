'use client'

import { Box } from '@mui/material'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      {children}
    </Box>
  )
} 