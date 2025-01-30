'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  FormHelperText,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RegistrationFormData, initialFormData } from '../../types/registration'

// Constants for form options
const SKILL_LEVELS = [
  { value: 'RECREATIONAL_C', label: 'Recreational C' },
  { value: 'INTERMEDIATE_B', label: 'Intermediate B' },
  { value: 'UPPER_INTERMEDIATE_BB', label: 'Upper Intermediate BB' },
  { value: 'COMPETITIVE_A', label: 'Competitive A' },
]

const LAST_PLAYED_OPTIONS = [
  { value: 'PLAYING_ACTIVELY', label: 'Playing Actively' },
  { value: 'NOT_PLAYED_SINCE_LAST_YEAR', label: 'Not Played since last year' },
  { value: 'NOT_PLAYED_IN_FEW_YEARS', label: 'Not played in few years' },
]

const PLAYING_POSITIONS = [
  { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
  { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
  { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
  { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
  { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
  { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' },
]

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']

const REGISTRATION_CATEGORIES = [
  { value: 'VOLLEYBALL_OPEN_MEN', label: 'Volleyball - Open Men' },
  { value: 'THROWBALL_WOMEN', label: 'Throwball - Women' },
  { value: 'THROWBALL_13_17_MIXED', label: 'Throwball - 13-17 Mixed' },
  { value: 'THROWBALL_8_12_MIXED', label: 'Throwball - 8-12 Mixed' },
]

export function RegistrationFormSingle() {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData)

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Validation functions
  const validateField = (name: keyof RegistrationFormData, value: any): string => {
    switch (name) {
      case 'phone_number':
        return !value.match(/^\+?[\d\s-]{10,}$/)
          ? 'Please enter a valid phone number'
          : ''
      case 'flat_number':
        return !value.match(/^[a-zA-Z]-\d{3,4}$/)
          ? 'Please enter a valid flat number (e.g., A-123 or a-123)'
          : ''
      case 'height':
        const height = parseFloat(value)
        return isNaN(height) || height < 100 || height > 250
          ? 'Height must be between 100cm and 250cm'
          : ''
      case 'last_played_date':
        return !value
          ? 'Please select your last played status'
          : ''
      case 'playing_positions':
        return !value || value.length === 0
          ? 'Please select a playing position'
          : ''
      case 'payment_upi_id':
        return !value.includes('@')
          ? 'Please enter a valid UPI ID'
          : ''
      case 'skill_level':
        return !value
          ? 'Please select your skill level'
          : ''
      case 'tshirt_name':
        return !value || !value.trim()
          ? 'Please enter the name for your jersey'
          : ''
      case 'tshirt_size':
        return !value
          ? 'Please select a t-shirt size'
          : ''
      case 'tshirt_number':
        if (!value || !value.trim()) {
          return 'Please enter a jersey number'
        }
        if (!value.match(/^\d{1,3}$/)) {
          return 'Jersey number must be a 1-3 digit number'
        }
        const number = parseInt(value)
        if (isNaN(number) || number < 1 || number > 999) {
          return 'Jersey number must be between 1 and 999'
        }
        return ''
      default:
        return !value || (typeof value === 'string' && !value.trim())
          ? 'This field is required'
          : ''
    }
  }

  // Handle input changes
  const handleChange = (field: keyof RegistrationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle select changes
  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    const { name, value } = event.target
    const error = validateField(name as keyof RegistrationFormData, value)
    setErrors(prev => ({ ...prev, [name]: error }))
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSnackbar({ open: false, message: '', severity: 'success' })

    try {
      // Validate all fields
      const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {}
      let hasErrors = false

      Object.keys(formData).forEach((field) => {
        const error = validateField(
          field as keyof RegistrationFormData,
          formData[field as keyof RegistrationFormData]
        )
        if (error) {
          newErrors[field as keyof RegistrationFormData] = error
          hasErrors = true
        }
      })

      setErrors(newErrors)

      if (hasErrors) {
        setSnackbar({
          open: true,
          message: 'Please fix the errors in the form before submitting',
          severity: 'error'
        })
        const firstErrorField = Object.keys(newErrors)[0]
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setIsSubmitting(false)
        return
      }

      console.log('Submitting form data:', formData)
      
      const response = await fetch('/api/tournaments/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Registration error details:', data)
        throw new Error(data.details || data.error || 'Registration failed')
      }

      // Handle success
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setSnackbar({
        open: true,
        message: `Registration successful! Your registration ID is: ${data.registrationId}. Please save this ID for future reference.`,
        severity: 'success'
      })

      // Wait a bit before resetting the form to ensure the user sees the success message
      setTimeout(() => {
        setFormData(initialFormData)
        setErrors({})
      }, 2000)

    } catch (error) {
      console.error('Registration error:', error)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setSnackbar({
        open: true,
        message: error instanceof Error 
          ? `Registration failed: ${error.message}` 
          : 'Registration failed. Please try again.',
        severity: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      noValidate 
      sx={{ position: 'relative' }}
    >
      {/* Loading overlay */}
      {isSubmitting && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={10000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Category Selection */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Category Selection" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="registration_category"
                  value={formData.registration_category}
                  label="Category"
                  onChange={handleSelectChange}
                >
                  {REGISTRATION_CATEGORIES.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Personal Details" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.first_name}
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
                value={formData.last_name}
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
                value={formData.phone_number}
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
                value={formData.flat_number}
                onChange={handleChange('flat_number')}
                error={!!errors.flat_number}
                helperText={errors.flat_number || 'Format: A-123 or a-123'}
                placeholder="A-123"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Player Profile */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Player Profile" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Height (cm)"
                value={formData.height || ''}
                onChange={handleChange('height')}
                error={!!errors.height}
                helperText={errors.height || 'Enter your height in centimeters'}
                InputProps={{ inputProps: { min: 100, max: 250, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.last_played_date} required>
                <InputLabel>Last Played Status</InputLabel>
                <Select
                  name="last_played_date"
                  value={formData.last_played_date}
                  label="Last Played Status"
                  onChange={handleSelectChange}
                >
                  {LAST_PLAYED_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.last_played_date && (
                  <FormHelperText>{errors.last_played_date}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.skill_level} required>
                <InputLabel>Skill Level</InputLabel>
                <Select
                  name="skill_level"
                  value={formData.skill_level}
                  label="Skill Level"
                  onChange={handleSelectChange}
                >
                  {SKILL_LEVELS.map(level => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.skill_level && (
                  <FormHelperText>{errors.skill_level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.playing_positions} required>
                <InputLabel>Playing Position</InputLabel>
                <Select
                  name="playing_positions"
                  value={formData.playing_positions[0] || ''}
                  label="Playing Position"
                  onChange={(event) => {
                    const value = event.target.value;
                    const error = validateField('playing_positions', value ? [value] : []);
                    setErrors(prev => ({ ...prev, playing_positions: error }));
                    setFormData(prev => ({ ...prev, playing_positions: value ? [value] : [] }));
                  }}
                >
                  {PLAYING_POSITIONS.map(position => (
                    <MenuItem key={position.value} value={position.value}>
                      {position.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.playing_positions && (
                  <FormHelperText>{errors.playing_positions}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Jersey Details */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Jersey Details" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.tshirt_size} required>
                <InputLabel>T-shirt Size</InputLabel>
                <Select
                  name="tshirt_size"
                  value={formData.tshirt_size}
                  label="T-shirt Size"
                  onChange={handleSelectChange}
                >
                  {TSHIRT_SIZES.map(size => (
                    <MenuItem key={size} value={size}>
                      {size}
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
                required
                fullWidth
                label="Jersey Name"
                value={formData.tshirt_name}
                onChange={handleChange('tshirt_name')}
                error={!!errors.tshirt_name}
                helperText={errors.tshirt_name || 'Name to be printed on jersey'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Jersey Number"
                value={formData.tshirt_number}
                onChange={handleChange('tshirt_number')}
                error={!!errors.tshirt_number}
                helperText={errors.tshirt_number || 'Enter a number between 1-999'}
                inputProps={{ 
                  maxLength: 3,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                type="text"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Payment Details" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="UPI ID"
                value={formData.payment_upi_id}
                onChange={handleChange('payment_upi_id')}
                error={!!errors.payment_upi_id}
                helperText={errors.payment_upi_id}
                placeholder="username@upi"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Transaction ID"
                value={formData.payment_transaction_id}
                onChange={handleChange('payment_transaction_id')}
                error={!!errors.payment_transaction_id}
                helperText={errors.payment_transaction_id}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Paid To"
                value={formData.paid_to}
                onChange={handleChange('paid_to')}
                error={!!errors.paid_to}
                helperText={errors.paid_to}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </Box>
    </Box>
  )
} 