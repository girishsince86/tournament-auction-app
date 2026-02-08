'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Box, Container, Typography, Button, Paper, CircularProgress, Alert, Grid } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ArticleIcon from '@mui/icons-material/Article'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getRegistrationStatus } from '@/features/tournaments/services/registration'
import { RegistrationFormData } from '@/features/tournaments/types/registration'
import {
  SKILL_LEVELS,
  REGISTRATION_CATEGORIES,
  LAST_PLAYED_OPTIONS,
  TSHIRT_SIZES,
} from '@/features/tournaments/components/registration/registration-constants'

const formatValue = (value: string | undefined, options: readonly { value: string; label: string }[]) => {
  if (!value) return '-'
  const option = options.find((opt) => opt.value === value)
  return option ? option.label : value
}

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams()
  const registrationId = searchParams.get('id')
  const [registration, setRegistration] = useState<RegistrationFormData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (registrationId) {
      setLoading(true)
      getRegistrationStatus(registrationId)
        .then(async (data) => {
          setRegistration(data.registration)
          setError(null)
        })
        .catch((err) => {
          console.error('Error fetching registration:', err)
          setError('Failed to load registration details for PDF')
        })
        .finally(() => setLoading(false))
    }
  }, [registrationId])

  const handleDownloadPdf = async () => {
    const input = document.getElementById('registration-success-content')
    if (!input || !registration) return

    try {
      // Small delay to ensure rendering matches
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // content using base64 should not trigger cross-origin taint
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

      const fileName = `${registration.first_name}_${registration.last_name}_${registration.registration_category}.pdf`.replace(/\s+/g, '_')
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          {registration && (
            <Button
              variant="outlined"
              onClick={handleDownloadPdf}
              startIcon={<ArticleIcon />}
              sx={{ textTransform: 'none', width: '100%', maxWidth: 300 }}
            >
              Download Registration PDF
            </Button>
          )}
          <Button
            component={Link}
            href="/tournaments/register"
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ textTransform: 'none', width: '100%', maxWidth: 300 }}
          >
            Register another participant
          </Button>
        </Box>

        {/* Hidden content for PDF generation */}
        {registration && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: -10000,
              width: '190mm', // Reduced from 210mm to avoid cutoff
              minHeight: '297mm', // A4 height
              bgcolor: '#ffffff',
              p: 4, // Reduced padding
              zIndex: -1,
              color: 'text.primary',
            }}
          >
            <Box id="registration-success-content" sx={{ bgcolor: '#ffffff', height: '100%', position: 'relative' }}>

              {/* Header */}
              <Box sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 2, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    PBEL City League 2026
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Volleyball & Throwball Tournament
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
                    Registration Form
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Personal & Registration Info */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                      Participant Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1" fontWeight="500">{registration.first_name} {registration.last_name}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Registration ID</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                          {registrationId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                        <Typography variant="body2">{new Date(registration.created_at || new Date()).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Mobile</Typography>
                        <Typography variant="body2">{registration.phone_number}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{registration.email}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Unit/Flat</Typography>
                        <Typography variant="body2">{registration.flat_number}</Typography>
                      </Grid>
                      {registration.date_of_birth && (
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                          <Typography variant="body2">{new Date(registration.date_of_birth).toLocaleDateString()}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Tournament Details */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                      Tournament Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                        <Typography variant="body1">
                          {formatValue(registration.registration_category, REGISTRATION_CATEGORIES)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Skill Level</Typography>
                        <Typography variant="body1">
                          {formatValue(registration.skill_level, SKILL_LEVELS)}
                        </Typography>
                      </Grid>
                      {registration.playing_positions && registration.playing_positions.length > 0 && (
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Playing Position</Typography>
                          <Typography variant="body1">{registration.playing_positions.join(', ')}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Last Played</Typography>
                        <Typography variant="body1">
                          {formatValue(registration.last_played_date, LAST_PLAYED_OPTIONS)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Jersey & Other */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ bgcolor: 'grey.100', p: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                      Kit & Payment Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2" color="text.secondary">Jersey Name</Typography>
                        <Typography variant="body1">{registration.tshirt_name}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle2" color="text.secondary">Number</Typography>
                        <Typography variant="body1">{registration.tshirt_number}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle2" color="text.secondary">Size</Typography>
                        <Typography variant="body1">
                          {formatValue(registration.tshirt_size, TSHIRT_SIZES)}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="subtitle2" color="text.secondary">Height</Typography>
                        <Typography variant="body1">{registration.height} cm</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2" color="text.secondary">Transaction ID</Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{registration.payment_transaction_id}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* Footer / Official Use */}
              <Box sx={{ mt: 8, pt: 4, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Generated on {new Date().toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    This is a computer-generated document.
                  </Typography>
                </Box>
                <Box sx={{ width: 200, borderTop: 1, borderColor: 'grey.400', pt: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Organizer Signature / Stamp
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
