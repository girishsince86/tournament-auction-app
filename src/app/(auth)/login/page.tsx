'use client'

import { Container, Paper, Typography, Box } from '@mui/material'
import { LoginForm } from '@/features/auth/components/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
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
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: 'primary.main'
            }}
          >
            Sign in to PBEL City VolleyBall & ThrowBall League Application
          </Typography>
          <LoginForm />
        </Paper>
      </Box>
    </Container>
  )
} 