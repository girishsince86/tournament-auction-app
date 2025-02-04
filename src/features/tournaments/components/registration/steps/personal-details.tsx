'use client'

import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import { useRegistrationForm } from '../../../hooks/use-registration-form'
import { useState } from 'react'

interface PersonalDetailsProps {
  onNext: () => void
  onBack: () => void
}

export function PersonalDetails({ onNext, onBack }: PersonalDetailsProps) {
  const { formData, updateFormData } = useRegistrationForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'phone_number':
        return !value.match(/^\+?[\d\s-]{10,}$/)
          ? 'Please enter a valid phone number'
          : ''
      case 'flat_number':
        return !value.trim()
          ? 'Flat number is required'
          : ''
      default:
        return !value.trim() ? 'This field is required' : ''
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
    updateFormData({ [field]: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    // Validate all fields
    const fieldsToValidate = [
      'first_name',
      'last_name',
      'phone_number',
      'flat_number'
    ]

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string)
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    if (!hasErrors) {
      onNext()
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Personal Details
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Please provide your personal information for league registration.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            value={formData.first_name || ''}
            onChange={handleChange('first_name')}
            error={!!errors.first_name}
            helperText={errors.first_name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            value={formData.last_name || ''}
            onChange={handleChange('last_name')}
            error={!!errors.last_name}
            helperText={errors.last_name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            value={formData.phone_number || ''}
            onChange={handleChange('phone_number')}
            error={!!errors.phone_number}
            helperText={errors.phone_number || 'Format: +91XXXXXXXXXX'}
            placeholder="+91XXXXXXXXXX"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Flat Number"
            value={formData.flat_number || ''}
            onChange={handleChange('flat_number')}
            error={!!errors.flat_number}
            helperText={errors.flat_number}
            placeholder="A-123"
          />
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