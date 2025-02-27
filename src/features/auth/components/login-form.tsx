'use client'

import { useState } from 'react'
import { TextField, Button, Alert, Box, Typography, Link, Paper } from '@mui/material'
import { useAuth } from '../context/auth-context'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isResetMode, setIsResetMode] = useState(false)
  const { signIn, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (isResetMode) {
        await resetPassword(email)
        setSuccess('Password reset email sent. Please check your inbox.')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isResetMode ? 'Failed to send reset email' : 'Failed to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleResetMode = () => {
    setIsResetMode(!isResetMode)
    setError(null)
    setSuccess(null)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />
      {!isResetMode && (
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting || (isResetMode && !email) || (!isResetMode && (!email || !password))}
      >
        {isSubmitting 
          ? (isResetMode ? 'Sending...' : 'Signing in...') 
          : (isResetMode ? 'Send Reset Link' : 'Sign In')}
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, mb: 2 }}>
        <Link 
          component="button" 
          variant="body2" 
          onClick={toggleResetMode} 
          type="button"
          underline="hover"
        >
          {isResetMode ? 'Back to Sign In' : 'Forgot Password?'}
        </Link>
      </Box>
      
      {isResetMode && (
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
        </Paper>
      )}
    </Box>
  )
} 