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

  const categoryData = [
    { label: 'Tournament Category', value: formData.registration_category },
  ]

  const personalData = [
    { label: 'First Name', value: formData.first_name },
    { label: 'Last Name', value: formData.last_name },
    { label: 'Email', value: formData.email },
    { label: 'Phone Number', value: formData.phone_number },
    { label: 'Date of Birth', value: formData.date_of_birth },
    { label: 'Emergency Contact', value: formData.emergency_contact_name },
    { label: 'Emergency Phone', value: formData.emergency_contact_phone },
  ]

  const profileData = [
    { label: 'Skill Level', value: formData.skill_level },
    { label: 'Years of Experience', value: formData.years_of_experience },
  ]

  const jerseyData = [
    { label: 'Jersey Size', value: formData.jersey_size },
    { label: 'Jersey Number', value: formData.jersey_number },
  ]

  const paymentData = [
    { label: 'Payment Method', value: formData.payment_method },
    { label: 'Payment Status', value: formData.payment_status },
  ]

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Review & Submit
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please review your registration details before submitting.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.50' }}>
        <ReviewSection title="Category" data={categoryData} />
        <Divider sx={{ my: 3 }} />
        <ReviewSection title="Personal Details" data={personalData} />
        <Divider sx={{ my: 3 }} />
        <ReviewSection title="Player Profile" data={profileData} />
        <Divider sx={{ my: 3 }} />
        <ReviewSection title="Jersey Details" data={jerseyData} />
        <Divider sx={{ my: 3 }} />
        <ReviewSection title="Payment Details" data={paymentData} />
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