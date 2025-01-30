'use client'

import { Container, Paper, Typography, Box, Button } from '@mui/material'

export default function VerifyEmailPage() {
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Check your email
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
          </Typography>
          <Button href="/(auth)/login" variant="contained" sx={{ mt: 2 }}>
            Return to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  )
} 