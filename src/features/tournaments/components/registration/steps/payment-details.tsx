'use client'

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import { useRegistrationForm } from '../../../hooks/use-registration-form'
import { useState } from 'react'

interface PaymentDetailsProps {
  onNext: () => void
  onBack: () => void
}

const paymentMethods = [
  {
    value: 'upi',
    label: 'UPI',
    description: 'Pay using any UPI app (Google Pay, PhonePe, Paytm, etc.)',
    paidTo: 'Girish Kumar (8123456789@ybl)',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer to tournament account',
    paidTo: 'PBEL Volleyball Club (Account: 1234567890)',
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Pay in cash at the venue',
    paidTo: 'Tournament Organizer',
  },
]

export function PaymentDetails({ onNext, onBack }: PaymentDetailsProps) {
  const { formData, updateFormData } = useRegistrationForm()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedMethod, setSelectedMethod] = useState<string>(formData.paid_to ? formData.paid_to : '')

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'paid_to':
        return !value ? 'Please select a payment method' : ''
      case 'payment_upi_id':
        return selectedMethod === 'upi' && !value ? 'Please enter your UPI ID' : ''
      case 'payment_transaction_id':
        return (selectedMethod === 'upi' || selectedMethod === 'bank_transfer') && !value
          ? 'Please enter the transaction ID'
          : ''
      default:
        return ''
    }
  }

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const selectedPaymentMethod = paymentMethods.find(method => method.value === value)
    
    if (selectedPaymentMethod) {
      setSelectedMethod(value)
      updateFormData({
        paid_to: selectedPaymentMethod.paidTo,
        // Reset these fields when changing payment method
        payment_upi_id: '',
        payment_transaction_id: '',
      })
    }
  }

  const handleTransactionIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const error = validateField('payment_transaction_id', value)
    setErrors(prev => ({ ...prev, payment_transaction_id: error }))
    updateFormData({ payment_transaction_id: value })
  }

  const handleUpiIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const error = validateField('payment_upi_id', value)
    setErrors(prev => ({ ...prev, payment_upi_id: error }))
    updateFormData({ payment_upi_id: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    // Validate based on selected payment method
    const error = validateField('paid_to', selectedMethod)
    if (error) {
      newErrors.paid_to = error
      hasErrors = true
    }

    if (selectedMethod === 'upi') {
      const upiError = validateField('payment_upi_id', formData.payment_upi_id)
      if (upiError) {
        newErrors.payment_upi_id = upiError
        hasErrors = true
      }
    }

    if (selectedMethod === 'upi' || selectedMethod === 'bank_transfer') {
      const transactionError = validateField('payment_transaction_id', formData.payment_transaction_id)
      if (transactionError) {
        newErrors.payment_transaction_id = transactionError
        hasErrors = true
      }
    }

    setErrors(newErrors)
    if (!hasErrors) {
      onNext()
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Payment Details
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select your preferred payment method.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl error={!!errors.paid_to} component="fieldset" fullWidth>
            <RadioGroup
              value={selectedMethod}
              onChange={handlePaymentMethodChange}
            >
              {paymentMethods.map(method => (
                <Box
                  key={method.value}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: selectedMethod === method.value ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <FormControlLabel
                    value={method.value}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1">{method.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          Pay to: {method.paidTo}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              ))}
            </RadioGroup>
            {errors.paid_to && (
              <FormHelperText>{errors.paid_to}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {selectedMethod === 'upi' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your UPI ID"
              value={formData.payment_upi_id}
              onChange={handleUpiIdChange}
              error={!!errors.payment_upi_id}
              helperText={errors.payment_upi_id || 'Enter your UPI ID (e.g., 1234567890@ybl)'}
            />
          </Grid>
        )}

        {(selectedMethod === 'upi' || selectedMethod === 'bank_transfer') && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Transaction ID"
              value={formData.payment_transaction_id}
              onChange={handleTransactionIdChange}
              error={!!errors.payment_transaction_id}
              helperText={errors.payment_transaction_id || 'Enter the transaction reference ID'}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" type="submit">
          Next
        </Button>
      </Box>
    </Box>
  )
} 