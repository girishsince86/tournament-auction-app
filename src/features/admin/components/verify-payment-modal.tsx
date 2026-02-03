'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
} from '@mui/material'
import { TournamentRegistration } from '@/features/tournaments/types/registration'

const DEFAULT_AMOUNT = 750

interface VerifyPaymentModalProps {
  open: boolean
  onClose: () => void
  registration: TournamentRegistration | null
  onVerify: (data: { 
    amount: number
    verifiedBy: string
    verificationNotes: string
  }) => void
  currentUser: string
}

export function VerifyPaymentModal({
  open,
  onClose,
  registration,
  onVerify,
  currentUser,
}: VerifyPaymentModalProps) {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!amount) {
      setError('Please enter the received amount')
      return
    }

    if (!currentUser) {
      setError('Unable to verify payment - user not authorized')
      return
    }

    onVerify({
      amount,
      verifiedBy: currentUser,
      verificationNotes: verificationNotes.trim(),
    })
    
    // Reset form
    setAmount(DEFAULT_AMOUNT)
    setVerificationNotes('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify Payment</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <Typography variant="body1">
            Verifying payment for: {registration?.first_name} {registration?.last_name}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Payment will be verified by: {currentUser}
          </Typography>

          <TextField
            label="Received Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
            required
            InputProps={{
              startAdornment: <Typography>₹</Typography>,
            }}
          />

          <TextField
            label="Verification Notes"
            multiline
            rows={3}
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            fullWidth
            placeholder="Add any payment-related notes here..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Verify Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
} 