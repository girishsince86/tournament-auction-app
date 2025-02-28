'use client'

import { Container, Paper, Typography, Box } from '@mui/material'
import { ChangePasswordForm } from './change-password-form'

export function ChangePasswordPage() {
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
            Change Your Password
          </Typography>
          <Typography 
            variant="body2" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter your current password and choose a new secure password
          </Typography>
          <ChangePasswordForm />
        </Paper>
      </Box>
    </Container>
  )
} 