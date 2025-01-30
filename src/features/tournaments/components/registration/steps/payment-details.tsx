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
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer to tournament account',
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Pay in cash at the venue',
  },
]

export function PaymentDetails({ onNext, onBack }: PaymentDetailsProps) {
  const { formData, updateFormData } = useRegistrationForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'payment_method':
        return !value ? 'Please select a payment method' : ''
      default:
        return ''
    }
  }

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const error = validateField('payment_method', value)
    setErrors(prev => ({ ...prev, payment_method: error }))
    updateFormData({
      payment_method: value,
      payment_status: 'pending',
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    const error = validateField('payment_method', formData.payment_method)
    if (error) {
      setErrors({ payment_method: error })
      return
    }

    onNext()
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
          <FormControl error={!!errors.payment_method} component="fieldset">
            <RadioGroup
              value={formData.payment_method}
              onChange={handlePaymentMethodChange}
            >
              {paymentMethods.map(method => (
                <Box
                  key={method.value}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: 1,
                    borderColor: formData.payment_method === method.value ? 'primary.main' : 'grey.300',
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
                      </Box>
                    }
                  />
                </Box>
              ))}
            </RadioGroup>
            {errors.payment_method && (
              <FormHelperText>{errors.payment_method}</FormHelperText>
            )}
          </FormControl>
        </Grid>
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