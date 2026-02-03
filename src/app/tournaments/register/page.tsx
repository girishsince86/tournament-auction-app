'use client'

import { RegistrationClosedBanner } from '@/features/tournaments/components/registration/registration-closed-banner'
import { RegistrationPageContent } from '@/features/tournaments/components/registration/registration-page-content'
import { Box, Container } from '@mui/material'

const isRegistrationOpen = process.env.NEXT_PUBLIC_REGISTRATION_OPEN === 'true'

export default function RegistrationPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {isRegistrationOpen ? (
          <RegistrationPageContent />
        ) : (
          <RegistrationClosedBanner />
        )}
      </Box>
    </Container>
  )
} 