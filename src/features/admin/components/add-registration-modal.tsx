'use client'

import { useState, useEffect } from 'react'
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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  useTheme,
  IconButton,
  Box,
  Chip,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { RegistrationCategory, TournamentRegistration, LastPlayedStatus } from '@/features/tournaments/types/registration'
import toast from 'react-hot-toast'

// Constants for dropdown options
const TSHIRT_SIZES = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: '2XL', label: '2XL' },
  { value: '3XL', label: '3XL' },
]

const SKILL_LEVELS = [
  { value: 'RECREATIONAL_C', label: 'Recreational (C)' },
  { value: 'INTERMEDIATE_B', label: 'Intermediate (B)' },
  { value: 'UPPER_INTERMEDIATE_BB', label: 'Upper Intermediate (BB)' },
  { value: 'COMPETITIVE_A', label: 'Competitive (A)' },
]

const LAST_PLAYED_OPTIONS = [
  { value: 'CURRENTLY_PLAYING', label: 'Currently Playing' },
  { value: 'WITHIN_LAST_YEAR', label: 'Within Last Year' },
  { value: 'WITHIN_LAST_5_YEARS', label: 'Within Last 5 Years' },
  { value: 'MORE_THAN_5_YEARS', label: 'More Than 5 Years Ago' },
  { value: 'NEVER_PLAYED', label: 'Never Played' },
]

const VOLLEYBALL_POSITIONS = [
  { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
  { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
  { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
  { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
  { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
  { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' },
]

const PAYMENT_RECEIVERS = {
  'Vasu Chepuru': 'Vasu',
  'Amit Saxena': 'Amit',
} as const;

interface AddRegistrationModalProps {
  open: boolean
  onClose: () => void
  category: RegistrationCategory
  onSubmit: (data: Partial<TournamentRegistration>) => Promise<void>
  currentUser: string
}

export function AddRegistrationModal({
  open,
  onClose,
  category,
  onSubmit,
  currentUser,
}: AddRegistrationModalProps) {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    flat_number: '',
    height: '',
    registration_category: category,
    registration_type: 'INDIVIDUAL',
    playing_position: '',
    skill_level: '',
    tshirt_size: '',
    tshirt_name: '',
    tshirt_number: '',
    payment_upi_id: '',
    payment_transaction_id: '',
    paid_to: Object.keys(PAYMENT_RECEIVERS)[0],
    date_of_birth: '',
    parent_name: '',
    parent_phone_number: '',
    last_played_date: '' as LastPlayedStatus,
  })
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when category changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      registration_category: category,
      playing_position: '',
      // Initialize volleyball-specific fields when category is volleyball
      ...(category === RegistrationCategory.VOLLEYBALL_OPEN_MEN ? {
        last_played_date: prev.last_played_date || 'CURRENTLY_PLAYING',
        skill_level: prev.skill_level || 'RECREATIONAL_C'
      } : {})
    }))
  }, [category])

  const isYouthCategory = (cat: RegistrationCategory) => {
    return cat === RegistrationCategory.THROWBALL_8_12_MIXED || 
           cat === RegistrationCategory.THROWBALL_13_17_MIXED
  }

  const isVolleyballCategory = (cat: RegistrationCategory) => {
    return cat === RegistrationCategory.VOLLEYBALL_OPEN_MEN
  }

  const getCategoryLabel = (cat: RegistrationCategory) => {
    switch (cat) {
      case RegistrationCategory.VOLLEYBALL_OPEN_MEN:
        return 'Volleyball - Open Men'
      case RegistrationCategory.THROWBALL_WOMEN:
        return 'Throwball - Women'
      case RegistrationCategory.THROWBALL_13_17_MIXED:
        return 'Throwball - 13-17 Mixed'
      case RegistrationCategory.THROWBALL_8_12_MIXED:
        return 'Throwball - 8-12 Mixed'
      default:
        return 'Unknown Category'
    }
  }

  // Handle form field changes
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Handle multi-select changes (for playing positions)
  const handleMultiSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[]
    setFormData(prev => ({ ...prev, playing_positions: value }))
    
    // Clear error when field is edited
    if (errors.playing_positions) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.playing_positions
        return newErrors
      })
    }
  }

  // Validate form fields
  const validateField = (name: string, value: any): string => {
    // Skip validation for optional fields if they're empty
    if (value === '' && !['first_name', 'last_name', 'email', 'phone_number', 'flat_number', 
                          'tshirt_size', 'tshirt_name', 'tshirt_number', 'payment_upi_id', 
                          'payment_transaction_id', 'paid_to'].includes(name)) {
      return ''
    }

    // For volleyball categories, validate required volleyball fields
    if (isVolleyballCategory(formData.registration_category)) {
      if (name === 'playing_position' && !value) {
        return 'Playing position is required for volleyball category'
      }
      if (name === 'last_played_date' && !value) {
        return 'Last played date is required for volleyball category'
      }
      if (name === 'skill_level' && !value) {
        return 'Skill level is required for volleyball category'
      }
    }

    // For youth categories, validate required youth fields
    if (isYouthCategory(formData.registration_category)) {
      if (name === 'date_of_birth' && !value) {
        return 'Date of birth is required for youth categories'
      }
      if (name === 'parent_name' && !value) {
        return 'Parent name is required for youth categories'
      }
      if (name === 'parent_phone_number') {
        const parentPhoneNumberWithoutPrefix = String(value).replace(/^\+91/, '').replace(/\s+/g, '')
        if (!parentPhoneNumberWithoutPrefix.match(/^\d{10}$/)) {
          return 'Please enter a valid 10-digit phone number for parent'
        }
      }
    }

    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value || String(value).trim().length < 2) {
          return `Please enter a valid ${name === 'first_name' ? 'first' : 'last'} name (minimum 2 characters)`
        }
        return ''
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value || !emailRegex.test(String(value))) {
          return 'Please enter a valid email address'
        }
        return ''
      case 'phone_number':
        const phoneNumberWithoutPrefix = String(value).replace(/^\+91/, '').replace(/\s+/g, '')
        if (!phoneNumberWithoutPrefix.match(/^\d{10}$/)) {
          return 'Please enter a valid 10-digit phone number'
        }
        return ''
      case 'flat_number':
        if (!value || !String(value).trim().match(/^[A-Z0-9-]{1,10}$/i)) {
          return 'Please enter a valid flat number (e.g., A-123)'
        }
        return ''
      case 'height':
        const heightNum = Number(value)
        if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
          return 'Please enter a valid height in centimeters (100-250)'
        }
        return ''
      case 'last_played_date':
        if (isVolleyballCategory(formData.registration_category) && (!value || !LAST_PLAYED_OPTIONS.some(opt => opt.value === value))) {
          return 'Please select when the player last played'
        }
        return ''
      case 'skill_level':
        if (isVolleyballCategory(formData.registration_category) && (!value || !SKILL_LEVELS.some(level => level.value === value))) {
          return 'Please select a skill level'
        }
        return ''
      case 'playing_position':
        if (isVolleyballCategory(formData.registration_category) && !value) {
          return 'Please select a playing position'
        }
        return ''
      case 'tshirt_size':
        if (!value || !TSHIRT_SIZES.some(size => size.value === value)) {
          return 'Please select a jersey size'
        }
        return ''
      case 'tshirt_name':
        if (!value || String(value).trim().length < 2 || String(value).trim().length > 15) {
          return 'Please enter a valid name for the jersey (2-15 characters)'
        }
        return ''
      case 'tshirt_number':
        const numberValue = Number(value)
        if (isNaN(numberValue) || numberValue < 1 || numberValue > 99) {
          return 'Please enter a valid jersey number (1-99)'
        }
        return ''
      case 'payment_upi_id':
        if (!value) {
          return 'Please enter the UPI ID or phone number'
        }
        return ''
      case 'payment_transaction_id':
        if (!value) {
          return 'Please enter the transaction ID'
        }
        return ''
      case 'paid_to':
        if (!value || !Object.keys(PAYMENT_RECEIVERS).includes(String(value))) {
          return 'Please select who received the payment'
        }
        return ''
      default:
        return ''
    }
  }

  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      const error = validateField(field, value)
      if (error) {
        newErrors[field] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    return !hasErrors
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convert height to number and ensure last_played_date is a valid LastPlayedStatus
      const submissionData = {
        ...formData,
        height: Number(formData.height),
        is_verified: true, // Auto-verify admin-created registrations
        verified_by: currentUser,
        verified_at: new Date().toISOString(),
        amount_received: 750, // Default amount
        last_played_date: formData.last_played_date as LastPlayedStatus,
        // Handle empty date fields - use undefined instead of null for type compatibility
        date_of_birth: formData.date_of_birth || undefined,
        parent_name: formData.parent_name || undefined,
        parent_phone_number: formData.parent_phone_number || undefined,
      }

      await onSubmit(submissionData)
      
      // Reset form and close modal
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        flat_number: '',
        height: '',
        registration_category: category,
        registration_type: 'INDIVIDUAL',
        playing_position: '',
        skill_level: '',
        tshirt_size: '',
        tshirt_name: '',
        tshirt_number: '',
        payment_upi_id: '',
        payment_transaction_id: '',
        paid_to: Object.keys(PAYMENT_RECEIVERS)[0],
        date_of_birth: '',
        parent_name: '',
        parent_phone_number: '',
        last_played_date: '' as LastPlayedStatus,
      })
      
      toast.success('Registration added successfully')
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add registration'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          Add New Registration: {getCategoryLabel(category)}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Personal Information
            </Typography>
          </Grid>
          
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
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
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
              helperText={errors.phone_number || 'Enter 10-digit number'}
              placeholder="+91"
              inputProps={{
                maxLength: 13, // +91 plus 10 digits
              }}
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
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Height (cm)"
              type="number"
              value={formData.height}
              onChange={handleChange('height')}
              error={!!errors.height}
              helperText={errors.height || 'Enter height in centimeters'}
              inputProps={{
                min: 100,
                max: 250,
              }}
            />
          </Grid>
          
          {/* Youth-specific fields */}
          {isYouthCategory(category) && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange('date_of_birth')}
                  error={!!errors.date_of_birth}
                  helperText={errors.date_of_birth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Parent Name"
                  value={formData.parent_name}
                  onChange={handleChange('parent_name')}
                  error={!!errors.parent_name}
                  helperText={errors.parent_name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Parent Phone Number"
                  value={formData.parent_phone_number}
                  onChange={handleChange('parent_phone_number')}
                  error={!!errors.parent_phone_number}
                  helperText={errors.parent_phone_number || 'Enter 10-digit number'}
                  placeholder="+91"
                  inputProps={{
                    maxLength: 13, // +91 plus 10 digits
                  }}
                />
              </Grid>
            </>
          )}
          
          {/* Sport Information */}
          {isVolleyballCategory(category) && (
            <>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Sport Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.last_played_date}>
                  <InputLabel>Last Played</InputLabel>
                  <Select
                    value={formData.last_played_date}
                    onChange={handleChange('last_played_date') as any}
                    label="Last Played"
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
                <FormControl fullWidth required error={!!errors.skill_level}>
                  <InputLabel>Skill Level</InputLabel>
                  <Select
                    value={formData.skill_level}
                    onChange={handleChange('skill_level') as any}
                    label="Skill Level"
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
                <FormControl fullWidth required error={!!errors.playing_position}>
                  <InputLabel>Playing Position</InputLabel>
                  <Select
                    value={formData.playing_position}
                    onChange={handleChange('playing_position') as any}
                    label="Playing Position"
                  >
                    {VOLLEYBALL_POSITIONS.map(position => (
                      <MenuItem key={position.value} value={position.value}>
                        {position.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.playing_position && (
                    <FormHelperText>{errors.playing_position}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </>
          )}
          
          {/* Jersey Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Jersey Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required error={!!errors.tshirt_size}>
              <InputLabel>Jersey Size</InputLabel>
              <Select
                value={formData.tshirt_size}
                onChange={handleChange('tshirt_size') as any}
                label="Jersey Size"
              >
                {TSHIRT_SIZES.map(size => (
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
          
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              label="Jersey Name"
              value={formData.tshirt_name}
              onChange={handleChange('tshirt_name')}
              error={!!errors.tshirt_name}
              helperText={errors.tshirt_name || '2-15 characters'}
              inputProps={{
                maxLength: 15,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              label="Jersey Number"
              type="number"
              value={formData.tshirt_number}
              onChange={handleChange('tshirt_number')}
              error={!!errors.tshirt_number}
              helperText={errors.tshirt_number || 'Number between 1-99'}
              inputProps={{
                min: 1,
                max: 99,
              }}
            />
          </Grid>
          
          {/* Payment Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Payment Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="UPI ID / Phone Number"
              value={formData.payment_upi_id}
              onChange={handleChange('payment_upi_id')}
              error={!!errors.payment_upi_id}
              helperText={errors.payment_upi_id}
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
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.paid_to}>
              <InputLabel>Paid To</InputLabel>
              <Select
                value={formData.paid_to}
                onChange={handleChange('paid_to') as any}
                label="Paid To"
              >
                {Object.entries(PAYMENT_RECEIVERS).map(([name, shortName]) => (
                  <MenuItem key={name} value={name}>
                    {name} ({shortName})
                  </MenuItem>
                ))}
              </Select>
              {errors.paid_to && (
                <FormHelperText>{errors.paid_to}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ 
        px: 3, 
        py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Add Registration'}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 