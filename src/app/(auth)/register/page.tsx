'use client'

import { Container, Paper, Typography, Box, Button, Alert } from '@mui/material'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Registration Disabled
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Registration is currently disabled. Please contact an administrator for access.
          </Alert>
          
          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push('/login')}
          >
            Return to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  )
} 