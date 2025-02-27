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
  Chip,
} from '@mui/material'
import { useRegistrationForm } from '../../../hooks/use-registration-form'
import { useState } from 'react'
import { SkillLevel, skillLevelDisplayText } from '@/lib/supabase/schema/players'

interface PlayerProfileProps {
  onNext: () => void
  onBack: () => void
}

const skillLevels = [
  { value: 'COMPETITIVE_A', label: skillLevelDisplayText.COMPETITIVE_A },
  { value: 'UPPER_INTERMEDIATE_BB', label: skillLevelDisplayText.UPPER_INTERMEDIATE_BB },
  { value: 'INTERMEDIATE_B', label: skillLevelDisplayText.INTERMEDIATE_B },
  { value: 'RECREATIONAL_C', label: skillLevelDisplayText.RECREATIONAL_C },
]

const playingPositions = [
  { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
  { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
  { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
  { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
  { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
  { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' },
]

export function PlayerProfile({ onNext, onBack }: PlayerProfileProps) {
  const { formData, updateFormData } = useRegistrationForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'height':
        const height = parseFloat(value)
        return isNaN(height) || height < 100 || height > 250
          ? 'Height must be between 100cm and 250cm'
          : ''
      case 'last_played_date':
        const date = new Date(value)
        const now = new Date()
        return date > now ? 'Last played date cannot be in the future' : ''
      case 'playing_positions':
        return (value as string[]).length === 0
          ? 'Please select at least one position'
          : ''
      case 'skill_level':
        return !value ? 'Please select your skill level' : ''
      default:
        return ''
    }
  }

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
    updateFormData({ [name]: value })
  }

  const handlePositionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[]
    const error = validateField('playing_positions', value)
    setErrors(prev => ({ ...prev, playing_positions: error }))
    updateFormData({ playing_positions: value })
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
    updateFormData({ [name]: value })
  }

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.round(parseFloat(event.target.value))  // Round to nearest whole number
    const error = validateField('height', value)
    setErrors(prev => ({ ...prev, height: error }))
    updateFormData({ height: value })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    // Validate all fields
    const fieldsToValidate = [
      'height',
      'last_played_date',
      'playing_positions',
      'skill_level'
    ]

    fieldsToValidate.forEach(field => {
      const value = formData[field as keyof typeof formData]
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
        Player Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tell us about your playing experience and preferences.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Height (cm)"
            value={formData.height || ''}
            onChange={handleHeightChange}
            error={!!errors.height}
            helperText={errors.height || 'Enter your height in centimeters (e.g., 175 for 1.75m)'}
            InputProps={{ 
              inputProps: { min: 100, max: 250, step: 1 },
              endAdornment: <Typography variant="caption" sx={{ ml: 1 }}>cm</Typography>
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="date"
            label="Last Played Date"
            value={formData.last_played_date || ''}
            onChange={handleDateChange}
            error={!!errors.last_played_date}
            helperText={errors.last_played_date}
            name="last_played_date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.skill_level}>
            <InputLabel id="skill-level-label">Skill Level</InputLabel>
            <Select
              labelId="skill-level-label"
              value={formData.skill_level || ''}
              label="Skill Level"
              name="skill_level"
              onChange={handleSelectChange}
            >
              {skillLevels.map(level => (
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
          <FormControl fullWidth error={!!errors.playing_positions}>
            <InputLabel id="positions-label">Playing Positions</InputLabel>
            <Select
              labelId="positions-label"
              multiple
              value={formData.playing_positions || []}
              label="Playing Positions"
              onChange={handlePositionsChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={playingPositions.find(pos => pos.value === value)?.label}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {playingPositions.map(position => (
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