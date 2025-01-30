'use client'

import { Container, Paper, Typography, Box } from '@mui/material'
import { RegisterForm } from '@/features/auth/components/register-form'

export default function RegisterPage() {
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
            Create your account
          </Typography>
          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  )
} 