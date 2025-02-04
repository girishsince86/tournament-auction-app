'use client'

import { Box, Container, Paper } from '@mui/material'
import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', width: 80, height: 80 }}>
            <Image
              src="/images/pbel-volleyball-logo.png"
              alt="PBEL City Volleyball Club"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
        </Box>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  )
} 