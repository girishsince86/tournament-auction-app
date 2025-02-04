'use client'

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import { useRegistrationForm } from '../../../hooks/use-registration-form'
import { useState } from 'react'

interface JerseyDetailsProps {
  onNext: () => void
  onBack: () => void
}

const jerseySizes = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: '2XL' },
  { value: '3XL', label: '3XL' },
  { value: '4XL', label: '4XL' },
]

export function JerseyDetails({ onNext, onBack }: JerseyDetailsProps) {
  const { formData, updateFormData } = useRegistrationForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'tshirt_size':
        return !value ? 'Please select your jersey size' : ''
      case 'tshirt_number':
        if (!value) return 'Please enter your preferred jersey number'
        const number = parseInt(value, 10)
        if (isNaN(number) || number < 0 || number > 99) {
          return 'Jersey number must be between 0 and 99'
        }
        return ''
      default:
        return ''
    }
  }

  const handleSizeChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    const error = validateField('tshirt_size', value)
    setErrors(prev => ({ ...prev, tshirt_size: error }))
    updateFormData({ tshirt_size: value as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL' })
  }

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const error = validateField('tshirt_number', value)
    setErrors(prev => ({ ...prev, tshirt_number: error }))
    updateFormData({ tshirt_number: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    // Validate all fields
    const fieldsToValidate = ['tshirt_size', 'tshirt_number']

    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof typeof formData] as string
      const error = validateField(field, value)
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
      <Typography variant="h5" gutterBottom>
        Jersey Details
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Select your jersey size and preferred number.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.tshirt_size}>
            <InputLabel id="jersey-size-label">Jersey Size</InputLabel>
            <Select
              labelId="jersey-size-label"
              value={formData.tshirt_size}
              label="Jersey Size"
              onChange={handleSizeChange}
            >
              {jerseySizes.map(size => (
                <MenuItem key={size.value} value={size.value}>
                  {size.label}
                </MenuItem>
              ))}
            </Select>
            {errors.tshirt_size && (
              <FormHelperText>{errors.tshirt_size}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Jersey Number"
            type="number"
            value={formData.tshirt_number}
            onChange={handleNumberChange}
            error={!!errors.tshirt_number}
            helperText={errors.tshirt_number || 'Choose a number between 0 and 99'}
            InputProps={{ inputProps: { min: 0, max: 99 } }}
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