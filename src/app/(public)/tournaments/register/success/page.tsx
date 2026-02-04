'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Box, Container, Typography, Button, Paper } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('id')

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ color: 'success.main', mb: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64 }} />
        </Box>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          Registration submitted
        </Typography>
        <Typography color="text.secondary" paragraph>
          Thank you for registering for the PBEL City Volleyball & Throwball League 2026.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A WhatsApp group for tournament participants will be created once registration is confirmed. Please await further details.
        </Typography>
        {registrationId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            If you need to contact us about this registration, you can quote this ID:{' '}
            <Box
              component="span"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'action.hover',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
              }}
            >
              {registrationId}
            </Box>
          </Typography>
        )}
        <Button
          component={Link}
          href="/tournaments/register"
          variant="contained"
          startIcon={<PersonAddIcon />}
          sx={{ textTransform: 'none' }}
        >
          Register another participant
        </Button>
      </Paper>
    </Container>
  )
}
