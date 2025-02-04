'use client'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material'
import { useRegistrationForm } from '../../../hooks/use-registration-form'
import { useRegistrationSubmit } from '../../../hooks/use-registration-submit'

interface ReviewSubmitProps {
  onNext: () => void
  onBack: () => void
}

interface ReviewSectionProps {
  title: string
  data: { label: string; value: string | number }[]
}

function ReviewSection({ title, data }: ReviewSectionProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>
      <Grid container spacing={2}>
        {data.map(({ label, value }) => (
          <Grid item xs={12} sm={6} key={label}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body1">
                {value || '-'}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export function ReviewSubmit({ onNext, onBack }: ReviewSubmitProps) {
  const { formData } = useRegistrationForm()
  const { isSubmitting, error, submitForm } = useRegistrationSubmit()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await submitForm(formData)
  }

  const reviewData = [
    { label: 'League Category', value: formData.registration_category },
    { label: 'Name', value: `${formData.first_name} ${formData.last_name}` },
    { label: 'Phone', value: formData.phone_number },
    { label: 'Flat Number', value: formData.flat_number },
    { label: 'Skill Level', value: formData.skill_level },
    { label: 'Last Played', value: formData.last_played_date },
    { label: 'T-shirt Size', value: formData.tshirt_size },
    { label: 'Playing Positions', value: formData.playing_positions?.join(', ') },
  ]

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Review Your Registration
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Please review your league registration details before submitting.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <ReviewSection title="Review Data" data={reviewData} />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </Box>
    </Box>
  )
} 