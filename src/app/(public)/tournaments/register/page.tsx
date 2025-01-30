import { Box, Container, Typography } from '@mui/material'
import { RegistrationFormSingle } from '@/features/tournaments/components/registration/registration-form-single'

export default function RegistrationPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tournament Registration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please fill out the form below to register for the tournament.
        </Typography>
      </Box>
      <RegistrationFormSingle />
    </Container>
  )
} 