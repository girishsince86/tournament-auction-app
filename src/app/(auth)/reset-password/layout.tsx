import { Container, Box, Paper } from '@mui/material'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | Tournament Auction App',
  description: 'Reset your password to access the Tournament Auction App',
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Container>
  )
} 