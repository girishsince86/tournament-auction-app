'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { Database } from '@/lib/supabase/types/supabase'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidLink, setIsValidLink] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    
    // Check if the URL contains a valid reset token
    const checkResetToken = async () => {
      try {
        setIsLoading(true)
        
        // Get the hash fragment from the URL, safely checking for window
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        
        if (!hash) {
          setError('Invalid or expired password reset link')
          setIsValidLink(false)
          return
        }
        
        // Verify the hash contains the necessary parameters
        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data.user) {
          setError('Invalid or expired password reset link')
          setIsValidLink(false)
        } else {
          setIsValidLink(true)
        }
      } catch (err) {
        console.error('Error checking reset token:', err)
        setError('An error occurred while validating your reset link')
        setIsValidLink(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkResetToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
      
      const { error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) throw error
      
      setSuccess('Password has been successfully reset')
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      console.error('Error resetting password:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Validating your reset link...
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Reset Your Password
      </Typography>
      
      {!isValidLink ? (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Invalid or expired password reset link'}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => router.push('/login')}
          >
            Return to Login
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
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
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting || !password || !confirmPassword}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" align="center">
            <Button href="/login" variant="text" size="small">
              Return to Login
            </Button>
          </Typography>
        </Box>
      )}
    </>
  )
} 