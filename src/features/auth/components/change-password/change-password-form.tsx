'use client'

import { useState } from 'react'
import { TextField, Button, Alert, Box, Typography, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/auth-context'
import { useRouter } from 'next/navigation'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { updatePassword } = useAuth()
  const router = useRouter()

  // Password validation
  const isPasswordValid = (password: string) => password.length >= 8
  const doPasswordsMatch = newPassword === confirmPassword
  const isFormValid = 
    currentPassword.length > 0 && 
    isPasswordValid(newPassword) && 
    doPasswordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    // Validate passwords
    if (!isPasswordValid(newPassword)) {
      setError('New password must be at least 8 characters long')
      setIsSubmitting(false)
      return
    }

    if (!doPasswordsMatch) {
      setError('New passwords do not match')
      setIsSubmitting(false)
      return
    }

    try {
      await updatePassword(currentPassword, newPassword)
      setSuccess(true)
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
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
          Password updated successfully! Redirecting...
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="currentPassword"
        label="Current Password"
        type="password"
        id="currentPassword"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        disabled={isSubmitting || success}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="newPassword"
        label="New Password"
        type="password"
        id="newPassword"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isSubmitting || success}
        error={newPassword.length > 0 && !isPasswordValid(newPassword)}
        helperText={
          newPassword.length > 0 && !isPasswordValid(newPassword)
            ? 'Password must be at least 8 characters long'
            : ''
        }
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
        disabled={isSubmitting || success}
        error={confirmPassword.length > 0 && !doPasswordsMatch}
        helperText={
          confirmPassword.length > 0 && !doPasswordsMatch
            ? 'Passwords do not match'
            : ''
        }
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting || !isFormValid || success}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            Updating...
          </>
        ) : (
          'Update Password'
        )}
      </Button>
    </Box>
  )
} 