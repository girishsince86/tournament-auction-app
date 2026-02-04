'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Collapse,
  Paper,
  Avatar,
  alpha,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Image from 'next/image'
import {
  RegistrationFormData,
  initialFormData,
  isYouthCategory,
  RegistrationCategory,
} from '../../types/registration'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import SportsHandballIcon from '@mui/icons-material/SportsHandball'
import PeopleIcon from '@mui/icons-material/People'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ArticleIcon from '@mui/icons-material/Article'
import GavelIcon from '@mui/icons-material/Gavel'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import StraightenIcon from '@mui/icons-material/Straighten'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { ErrorBoundary } from '@/components/error-boundary'
import { useRegistrationFormSingle } from '@/features/tournaments/hooks/useRegistrationFormSingle'
import type { SectionName } from './registration-constants'
import { isVolleyballCategory } from './registration-validation'
import {
  REGISTRATION_CATEGORIES,
  SKILL_LEVELS,
  LAST_PLAYED_OPTIONS,
  PLAYING_POSITIONS,
  PAYMENT_RECEIVERS,
  TSHIRT_SIZES,
  TOURNAMENT_RULES,
} from './registration-constants'
import { RegistrationTicker } from './registration-ticker'
import {
  StyledTextField,
  StyledFormControl,
  ExpandMore,
  StatusChip,
  PrintStyles,
} from './registration-styles'

export function RegistrationFormSingle() {
  const theme = useTheme()
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    setIsSubmitting,
    expandedSections,
    isSubmitting,
    snackbar,
    setSnackbar,
    rulesAcknowledged,
    setRulesAcknowledged,
    residencyConfirmed,
    setResidencyConfirmed,
    rulesDialogOpen,
    setRulesDialogOpen,
    showSuccessDialog,
    setShowSuccessDialog,
    registrationId,
    sizeChartOpen,
    setSizeChartOpen,
    referenceLoading,
    referenceMessage,
    profileImageUploading,
    profileImagePreviewUrl,
    profileImageInputRef,
    isSectionComplete,
    validateField,
    handleChange,
    handleSelectChange,
    handleExpandSection,
    handleSectionCompletion,
    handleProfileImageChange,
    removeProfileImage,
    loadReference,
    handleSubmit,
    getFormattedDetails,
    initialFormData: initFormData,
  } = useRegistrationFormSingle()

  const [paymentGateComplete, setPaymentGateComplete] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [prefillCardExpanded, setPrefillCardExpanded] = useState(false)
  useEffect(() => {
    if (!isMobile) setPrefillCardExpanded(true)
  }, [isMobile])
  // When moving to the registration form (second screen), scroll to top so page loads from start
  useEffect(() => {
    if (paymentGateComplete) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [paymentGateComplete])

  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }))

  const sections = ['category', 'personal', 'profile', 'jersey', 'payment'] as const
  const completedCount =
    (rulesAcknowledged ? 1 : 0) +
    (residencyConfirmed ? 1 : 0) +
    sections.filter((s) => isSectionComplete(s as SectionName)).length
  const totalSteps = 2 + sections.length // rules + residency + 5 sections
  const completionPercent = Math.round((completedCount / totalSteps) * 100)
  const canSubmit =
    !isSubmitting &&
    rulesAcknowledged &&
    residencyConfirmed &&
    sections.every((s) => isSectionComplete(s as SectionName))

  const handleProceedAfterPayment = () => {
    const errPaidTo = validateField('paid_to', formData.paid_to, formData)
    const errTx = validateField('payment_transaction_id', formData.payment_transaction_id, formData)
    const errUpi = validateField('payment_upi_id', formData.payment_upi_id, formData)
    setErrors((prev) => ({
      ...prev,
      paid_to: errPaidTo,
      payment_transaction_id: errTx,
      payment_upi_id: errUpi,
    }))
    if (!errPaidTo && !errTx && !errUpi) setPaymentGateComplete(true)
  }

  const reviewData = [
    { label: 'League Category', value: REGISTRATION_CATEGORIES.find(c => c.value === formData.registration_category)?.label || '' },
    { label: 'Name', value: formData.first_name + ' ' + formData.last_name },
    { label: 'Email', value: formData.email },
    { label: 'Phone', value: formData.phone_number },
    { label: 'Flat Number', value: formData.flat_number },
    ...(isYouthCategory(formData.registration_category) ? [
      { label: 'Date of Birth', value: formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : '' },
      { label: 'Parent/Guardian Name', value: formData.parent_name },
      { label: 'Parent/Guardian Phone', value: formData.parent_phone_number },
    ] : []),
    { label: 'Skill Level', value: SKILL_LEVELS.find(l => l.value === formData.skill_level)?.label || '' },
    { label: 'Last Played', value: LAST_PLAYED_OPTIONS.find(o => o.value === formData.last_played_date)?.label || '' },
    { label: 'T-shirt Size', value: formData.tshirt_size },
    { label: 'Playing Positions', value: formData.playing_positions?.map(p => 
      PLAYING_POSITIONS.find(pos => pos.value === p)?.label
    ).join(', ') || '' },
  ];

  // Add size chart dialog component
  const SizeChartDialog = () => (
    <Dialog
      open={sizeChartOpen}
      onClose={() => setSizeChartOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <StraightenIcon color="primary" />
        T-Shirt Size Chart
      </DialogTitle>
      <DialogContent>
        <Box sx={{ position: 'relative', width: '100%', height: 'auto' }}>
          <Image
            src="/images/tshirt-size-chart.png"
            alt="T-Shirt Size Chart"
            width={800}
            height={600}
            style={{ 
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
            priority
          />
          <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            * All measurements are in inches with ±3% tolerance permissible
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSizeChartOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ErrorBoundary
      onReset={() => {
        setIsSubmitting(false)
        setErrors({})
        setSnackbar({
          open: true,
          message: 'Form has been reset. Please try again.',
          severity: 'success',
        })
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }}>
        <PrintStyles />
        <form 
          onSubmit={handleSubmit} 
          noValidate 
          style={{ position: 'relative' }}
        >
          {/* Loading overlay */}
          {isSubmitting && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
            className="mt-4"
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              variant="filled"
              className="w-full text-base shadow-lg"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Payment gate: show first, then form after payment + transaction details */}
          {!paymentGateComplete ? (
            <Card
              sx={{
                mb: 3,
                overflow: 'visible',
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Tournament banner with logo */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: { xs: 2, sm: 3 },
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.primary.dark, 0.08)})`,
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: '12px 12px 0 0',
                  }}
                >
                  <Box sx={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                    <Image
                      src="/pbel-volleyball-logo.png"
                      alt="PBEL Volleyball & Throwball League"
                      width={64}
                      height={64}
                      style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', lineHeight: 1.2 }}>
                      PBEL City Volleyball
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      & Throwball League 2026 — Registration
                    </Typography>
                  </Box>
                </Box>

                {/* Step 1: Complete your payment — at top */}
                <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>
                    Step 1: Complete your payment
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
                    Registration fee: <strong>INR 750</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Pay to one of the following (UPI or bank transfer):
                  </Typography>
                  <Box sx={{ pl: 2, mb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>• Vasu Chepuru — 9849521594</Typography>
                    <Typography variant="body1">• Amit Saxena — 9866674460</Typography>
                  </Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Please complete the payment first. Then confirm below and enter who you paid and your transaction details.
                  </Alert>

                  {!showTransactionForm ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => setShowTransactionForm(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      I have completed the payment
                    </Button>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Enter transaction details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <StyledFormControl fullWidth error={!!errors.paid_to} required>
                            <InputLabel>Payment was made to</InputLabel>
                            <Select
                              name="paid_to"
                              value={formData.paid_to}
                              label="Payment was made to"
                              onChange={handleSelectChange}
                            >
                              {PAYMENT_RECEIVERS.map((receiver) => (
                                <MenuItem key={receiver.value} value={receiver.value}>
                                  {receiver.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.paid_to && (
                              <FormHelperText>{errors.paid_to}</FormHelperText>
                            )}
                          </StyledFormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <StyledTextField
                            required
                            fullWidth
                            label="Transaction ID"
                            value={formData.payment_transaction_id}
                            onChange={handleChange('payment_transaction_id')}
                            error={!!errors.payment_transaction_id}
                            helperText={errors.payment_transaction_id}
                            placeholder="e.g. UPI reference number"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <StyledTextField
                            required
                            fullWidth
                            label="UPI ID / Phone number used to pay"
                            value={formData.payment_upi_id}
                            onChange={handleChange('payment_upi_id')}
                            error={!!errors.payment_upi_id}
                            helperText={errors.payment_upi_id}
                            placeholder="username@upi or phone number"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleProceedAfterPayment}
                            sx={{ borderRadius: 2 }}
                          >
                            Proceed to registration form
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>

                {/* How registration works — below Step 1 */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2.5,
                    bgcolor: alpha(theme.palette.grey[50], 0.8),
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                    }}
                  >
                    How registration works
                  </Typography>
                  <Box
                    component="ol"
                    sx={{
                      m: 0,
                      p: 0,
                      listStyle: 'none',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.5,
                      counterReset: 'step',
                    }}
                  >
                    {[
                      { title: 'Payment', desc: 'Pay INR 750 and enter transaction details', current: true },
                      { title: 'Rules & category', desc: 'Accept rules and choose Volleyball or Throwball category', current: false },
                      { title: 'Personal details', desc: 'Name, email, phone, flat number, profile photo (required)', current: false },
                      { title: 'Player profile', desc: 'Height, skill level, positions, experience', current: false },
                      { title: 'Jersey', desc: 'T-shirt size, name on jersey, number', current: false },
                      { title: 'Review & submit', desc: 'Check details and submit registration', current: false },
                    ].map((step) => (
                      <Box
                        key={step.title}
                        component="li"
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: { xs: 1, sm: 1.5 },
                          counterIncrement: 'step',
                          p: { xs: 1, sm: 1.5 },
                          borderRadius: 2,
                          bgcolor: step.current ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          border: step.current ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}` : '1px solid transparent',
                          transition: 'background-color 0.2s, border-color 0.2s',
                          '&::before': {
                            content: 'counter(step)',
                            flexShrink: 0,
                            width: { xs: 24, sm: 28 },
                            height: { xs: 24, sm: 28 },
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                            fontWeight: 700,
                            bgcolor: step.current ? theme.palette.primary.main : theme.palette.grey[300],
                            color: step.current ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0, pt: 0.25 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                              color: step.current ? 'primary.main' : 'text.primary',
                              lineHeight: 1.3,
                            }}
                          >
                            {step.title}
                            {step.current && (
                              <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 500 }}>
                                (you are here)
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4, mt: 0.25, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {step.desc}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 2,
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      color: 'text.secondary',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Returning players:</strong> You can pre-fill the form with your last year’s details using your phone number or email (in the Personal details step), then edit as needed and submit.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
          {/* Form Header with Sports Image */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, sm: 6 },
            position: 'relative',
            height: { xs: 280, sm: 380, md: 320 },
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: theme.shadows[4],
          }}>
            <Image
              src="/volleyball-court-bg.jpg"
              alt="PBEL City Sports Tournament"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <Box sx={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(165deg, 
                ${alpha(theme.palette.primary.dark, 0.95)} 0%, 
                ${alpha(theme.palette.primary.main, 0.85)} 50%,
                ${alpha(theme.palette.primary.light, 0.75)} 100%)`,
              display: 'flex',
              padding: { xs: 2, sm: 3, md: 4 },
            }}>
              {/* Text Content */}
              <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                color: 'white',
                pr: { xs: 2, sm: 3, md: 4 },
              }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    maxWidth: '100%',
                    background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  PBEL City VolleyBall and ThrowBall League 2026
                </Typography>
                <Box sx={{ 
                  width: 60, 
                  height: '4px', 
                  bgcolor: alpha('#fff', 0.9),
                  mb: 3,
                  borderRadius: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }} />
                <Typography 
                  variant="h6"
                  sx={{ 
                    mb: 3,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    fontWeight: 500,
                    color: alpha('#fff', 0.95),
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    letterSpacing: '1px',
                    textAlign: 'left',
                  }}
                >
                  Bringing Our Community Together Through Sports
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                    opacity: 0.9,
                    textAlign: 'left',
                    maxWidth: '600px',
                  }}
                >
                  Welcome to PBEL City's premier sports event! Register below to participate in our annual League. 
                  Whether you're a volleyball enthusiast or throwball player, join us for an exciting competition 
                  that celebrates sportsmanship and community spirit.
                </Typography>
              </Box>

              {/* Club Logo */}
              <Box 
                sx={{ 
                  position: 'relative',
                  width: { xs: '120px', sm: '160px', md: '200px' },
                  height: { xs: '120px', sm: '160px', md: '200px' },
                  alignSelf: 'center',
                  bgcolor: 'white',
                  borderRadius: '50%',
                  p: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                <Image
                  src="/images/pbel-volleyball-logo.png"
                  alt="PBEL City Volleyball Club"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
            </Box>
          </Box>

          <RegistrationTicker />

          {/* Completion progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Registration progress
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {completionPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercent}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          {/* Pre-fill from last year - collapsible on mobile to save space */}
          <Card
            sx={{
              mb: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              '& .MuiInputLabel-root': { color: theme.palette.text.primary },
              '& .MuiOutlinedInput-input': { color: theme.palette.text.primary },
            }}
          >
            {isMobile ? (
              <>
                <CardHeader
                  onClick={() => setPrefillCardExpanded((v) => !v)}
                  sx={{
                    cursor: 'pointer',
                    py: 1.5,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                  }}
                  title={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Returning player? Pre-fill from last year
                    </Typography>
                  }
                  action={
                    <ExpandMore
                      expand={prefillCardExpanded}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPrefillCardExpanded((v) => !v)
                      }}
                      aria-expanded={prefillCardExpanded}
                      aria-label={prefillCardExpanded ? 'Collapse pre-fill' : 'Expand pre-fill'}
                    >
                      <ExpandMoreIcon />
                    </ExpandMore>
                  }
                />
                <Collapse in={prefillCardExpanded}>
                  <CardContent sx={{ pt: 0 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.8125rem' }}>
                      Enter email or phone from last year to load your details.
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          size="small"
                          label="Email (optional)"
                          value={formData.email}
                          onChange={handleChange('email')}
                          placeholder="your.email@example.com"
                          InputLabelProps={{ sx: { color: 'text.primary' } }}
                          inputProps={{ sx: { color: 'text.primary' } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          size="small"
                          label="Phone (optional)"
                          value={formData.phone_number}
                          onChange={handleChange('phone_number')}
                          placeholder="+91"
                          InputLabelProps={{ sx: { color: 'text.primary' } }}
                          inputProps={{ sx: { color: 'text.primary' } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="button"
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={loadReference}
                          disabled={referenceLoading}
                          size="medium"
                          sx={{ minHeight: 44 }}
                        >
                          {referenceLoading ? 'Loading…' : 'Load my 2025 details'}
                        </Button>
                      </Grid>
                      {referenceMessage && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            {referenceMessage}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Collapse>
              </>
            ) : (
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Returning player? Pre-fill from last year
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Enter your email or phone from last year’s registration to load your details, then edit as needed and submit.
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      fullWidth
                      size="small"
                      label="Email (optional)"
                      value={formData.email}
                      onChange={handleChange('email')}
                      placeholder="your.email@example.com"
                      InputLabelProps={{ sx: { color: 'text.primary' } }}
                      inputProps={{ sx: { color: 'text.primary' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      fullWidth
                      size="small"
                      label="Phone (optional)"
                      value={formData.phone_number}
                      onChange={handleChange('phone_number')}
                      placeholder="+91"
                      InputLabelProps={{ sx: { color: 'text.primary' } }}
                      inputProps={{ sx: { color: 'text.primary' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="primary"
                      onClick={loadReference}
                      disabled={referenceLoading}
                      size="medium"
                    >
                      {referenceLoading ? 'Loading…' : 'Load my 2025 details'}
                    </Button>
                  </Grid>
                  {referenceMessage && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {referenceMessage}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            )}
          </Card>

          {/* Tournament Rules Section */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              avatar={<GavelIcon color="primary" sx={{ display: { xs: 'none', sm: 'flex' } }} />}
              title="League Rules & Guidelines"
              action={
                <Button
                  startIcon={<ArticleIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                  onClick={() => setRulesDialogOpen(true)}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {isMobile ? 'View Rules' : 'View Complete Rules'}
                </Button>
              }
              sx={{
                flexWrap: 'wrap',
                '& .MuiCardHeader-content': { minWidth: 0 },
                '& .MuiCardHeader-action': { alignSelf: 'center', mt: { xs: 1, sm: 0 } },
              }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                Please read and acknowledge the League rules before proceeding. The rulebook covers match formats, scoring, and code of conduct.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rulesAcknowledged}
                      onChange={(e) => setRulesAcknowledged(e.target.checked)}
                      color="primary"
                      sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                      I have read and agree to follow the League rules and guidelines
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={residencyConfirmed}
                      onChange={(e) => setResidencyConfirmed(e.target.checked)}
                      color="primary"
                      sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                      I confirm that I am a resident of PBEL City at the time of registration and for the entire duration of this league
                    </Typography>
                  }
                />
              </Box>
            </CardContent>
          </Card>

          {/* Rules Dialog */}
          <Dialog
            open={rulesDialogOpen}
            onClose={() => setRulesDialogOpen(false)}
            maxWidth="md"
            fullWidth
            scroll="paper"
          >
            <DialogTitle sx={{ 
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <GavelIcon color="primary" />
              League Rules & Guidelines
            </DialogTitle>
            <DialogContent dividers>
              {TOURNAMENT_RULES.map((section, index) => (
                <Box key={section.title} sx={{ mb: index !== TOURNAMENT_RULES.length - 1 ? 4 : 0 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    {section.title}
                  </Typography>
                  <ul style={{ paddingLeft: '1.5rem', marginTop: 0 }}>
                    {section.rules.map((rule, ruleIndex) => (
                      <li key={ruleIndex}>
                        <Typography variant="body2" paragraph>
                          {rule}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRulesDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setRulesAcknowledged(true);
                  setRulesDialogOpen(false);
                }}
              >
                Accept Rules
              </Button>
            </DialogActions>
          </Dialog>

          {/* Category Selection */}
          <Card sx={{ mb: 2 }} data-section="category">
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">Category Selection</Typography>
                  <StatusChip
                    label={isSectionComplete('category') ? 'Completed' : 'Incomplete'}
                    className={isSectionComplete('category') ? 'completed' : 'incomplete'}
                    icon={isSectionComplete('category') ? <CheckCircleIcon /> : <ErrorIcon />}
                    size="small"
                  />
                </Box>
              }
              action={
                <ExpandMore
                  expand={expandedSections.category}
                  onClick={() => handleExpandSection('category')}
                  aria-expanded={expandedSections.category}
                  aria-label="show category selection"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              }
            />
            <Collapse in={expandedSections.category}>
              <CardContent>
                {formData.registration_category === 'VOLLEYBALL_OPEN_MEN' && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      '& .MuiAlert-message': {
                        width: '100%'
                      },
                      bgcolor: 'primary.lighter'
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEventsIcon /> New: Team Formation through Auction System!
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                        For the first time in PBEL City Volleyball League, teams will be formed through an exciting auction process!
                      </Typography>
                      <Typography variant="body2">
                        • All registered players will be part of an auction pool<br />
                        • Team Mascots will bid for players based on their profiles<br />
                        • This ensures balanced teams and makes the league more competitive and fun
                      </Typography>
                    </Box>
                  </Alert>
                )}
                
                <Grid container spacing={3}>
                  {REGISTRATION_CATEGORIES.map((category) => (
                    <Grid item xs={12} sm={6} md={3} key={category.value}>
                      <Paper
                        elevation={formData.registration_category === category.value ? 3 : 1}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          border: t => `2px solid ${formData.registration_category === category.value ? t.palette.primary.main : t.palette.divider}`,
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'primary.lighter'
                          }
                        }}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            registration_category: category.value as RegistrationCategory
                          }));
                          handleSectionCompletion('category');
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          {category.value.includes('VOLLEYBALL') ? (
                            <SportsVolleyballIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          ) : (
                            <SportsHandballIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          )}
                        </Box>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="bold"
                          sx={{ mb: 1 }}
                        >
                          {category.label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                          }}
                        >
                          {category.value.includes('MIXED') ? (
                            <>
                              <PeopleIcon sx={{ fontSize: 16 }} />
                              Mixed Category
                            </>
                          ) : category.value.includes('WOMEN') ? (
                            'Women Only'
                          ) : category.value.includes('VOLLEYBALL') ? (
                            'Open for All'
                          ) : (
                            'Men Only'
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                {errors.registration_category && (
                  <FormHelperText error sx={{ mt: 2, textAlign: 'center' }}>
                    {errors.registration_category}
                  </FormHelperText>
                )}
              </CardContent>
            </Collapse>
          </Card>

          {/* Personal Details */}
          <Card sx={{ mb: 2 }} data-section="personal">
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">Personal Details</Typography>
                  <StatusChip
                    label={isSectionComplete('personal') ? 'Completed' : 'Incomplete'}
                    className={isSectionComplete('personal') ? 'completed' : 'incomplete'}
                    icon={isSectionComplete('personal') ? <CheckCircleIcon /> : <ErrorIcon />}
                    size="small"
                  />
                </Box>
              }
              action={
                <ExpandMore
                  expand={expandedSections.personal}
                  onClick={() => handleExpandSection('personal')}
                  aria-expanded={expandedSections.personal}
                  aria-label="show personal details"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              }
            />
            <Collapse in={expandedSections.personal}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                      Profile photo (required)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <input
                        ref={profileImageInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleProfileImageChange}
                        style={{ display: 'none' }}
                        aria-label="Upload profile photo"
                      />
                      {(profileImagePreviewUrl || formData.profile_image_url) ? (
                        <>
                          <Avatar
                            src={profileImagePreviewUrl || formData.profile_image_url || ''}
                            alt="Profile preview"
                            variant="rounded"
                            imgProps={{ crossOrigin: 'anonymous' }}
                            sx={{
                              width: 80,
                              height: 80,
                              '& img': { objectFit: 'cover' },
                            }}
                          />
                          <Box>
                            <Button
                              type="button"
                              size="small"
                              color="secondary"
                              onClick={removeProfileImage}
                              disabled={profileImageUploading}
                            >
                              Remove photo
                            </Button>
                          </Box>
                        </>
                      ) : (
<Button
                              type="button"
                              variant="outlined"
                              {...({ component: 'span' } as const)}
                              startIcon={profileImageUploading ? <CircularProgress size={20} /> : <PhotoCameraIcon />}
                              disabled={profileImageUploading}
                              onClick={() => profileImageInputRef.current?.click()}
                            >
                          {profileImageUploading ? 'Uploading…' : 'Take or upload photo'}
                        </Button>
                      )}
                    </Box>
                    {errors.profile_image_url && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        {errors.profile_image_url}
                      </FormHelperText>
                    )}
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      Use camera or choose from gallery. Max 5MB; JPEG, PNG or WebP.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
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
                    <StyledTextField
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
                    <StyledTextField
                      required
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      error={!!errors.email}
                      helperText={errors.email || 'Enter a valid email address'}
                      placeholder="your.email@example.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
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
                    <StyledTextField
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

                  {/* Youth-specific fields */}
                  {isYouthCategory(formData.registration_category) && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, mt: 2 }}>
                          Additional Information Required for Youth Category
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          required
                          fullWidth
                          label="Date of Birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={handleChange('date_of_birth')}
                          error={!!errors.date_of_birth}
                          helperText={errors.date_of_birth || (
                            formData.registration_category === 'THROWBALL_8_12_MIXED' 
                              ? 'Age must be between 8-12 years'
                              : 'Age must be between 13-17 years'
                          )}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          required
                          fullWidth
                          label="Parent/Guardian Name"
                          value={formData.parent_name}
                          onChange={handleChange('parent_name')}
                          error={!!errors.parent_name}
                          helperText={errors.parent_name}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          required
                          fullWidth
                          label="Parent/Guardian Phone Number"
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
                </Grid>
              </CardContent>
            </Collapse>
          </Card>

          {/* Player Profile */}
          <Card sx={{ mb: 2 }} data-section="profile">
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">Player Profile</Typography>
                  <StatusChip
                    label={isSectionComplete('profile') ? 'Completed' : 'Incomplete'}
                    className={isSectionComplete('profile') ? 'completed' : 'incomplete'}
                    icon={isSectionComplete('profile') ? <CheckCircleIcon /> : <ErrorIcon />}
                    size="small"
                  />
                </Box>
              }
              action={
                <ExpandMore
                  expand={expandedSections.profile}
                  onClick={() => handleExpandSection('profile')}
                  aria-expanded={expandedSections.profile}
                  aria-label="show player profile"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              }
            />
            <Collapse in={expandedSections.profile}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      required
                      fullWidth
                      type="number"
                      label="Height (cm)"
                      value={formData.height || ''}
                      onChange={handleChange('height')}
                      error={!!errors.height}
                      helperText={errors.height || 'Enter your height in centimeters'}
                      InputProps={{ 
                        inputProps: { min: 100, max: 250, step: 1 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth error={!!errors.last_played_date} required>
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
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledFormControl fullWidth error={!!errors.skill_level} required>
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
                    </StyledFormControl>
                  </Grid>
                  {isVolleyballCategory(formData.registration_category) && (
                    <Grid item xs={12} sm={6}>
                      <StyledFormControl fullWidth error={!!errors.playing_positions} required>
                        <InputLabel>Playing Position</InputLabel>
                        <Select
                          name="playing_positions"
                          value={formData.playing_positions[0] || ''}
                          label="Playing Position"
                          onChange={(event) => {
                            const value = event.target.value;
                            const arr = value ? [value] : [];
                            const nextData = { ...formData, playing_positions: arr };
                            const error = validateField('playing_positions', arr, nextData);
                            setErrors(prev => ({ ...prev, playing_positions: error }));
                            setFormData(prev => ({ ...prev, playing_positions: arr }));
                            setTimeout(() => handleSectionCompletion('profile'), 100);
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
                      </StyledFormControl>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Collapse>
          </Card>

          {/* Jersey Details */}
          <Card sx={{ mb: 2 }} data-section="jersey">
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">Jersey Details</Typography>
                  <StatusChip
                    label={isSectionComplete('jersey') ? 'Completed' : 'Incomplete'}
                    className={isSectionComplete('jersey') ? 'completed' : 'incomplete'}
                    icon={isSectionComplete('jersey') ? <CheckCircleIcon /> : <ErrorIcon />}
                    size="small"
                  />
                </Box>
              }
              action={
                <ExpandMore
                  expand={expandedSections.jersey}
                  onClick={() => handleExpandSection('jersey')}
                  aria-expanded={expandedSections.jersey}
                  aria-label="show jersey details"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              }
            />
            <Collapse in={expandedSections.jersey}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ position: 'relative' }}>
                      <StyledFormControl fullWidth error={!!errors.tshirt_size} required>
                        <InputLabel>T-shirt Size</InputLabel>
                        <Select
                          name="tshirt_size"
                          value={formData.tshirt_size}
                          label="T-shirt Size"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="">
                            <em>Select a size</em>
                          </MenuItem>
                          {TSHIRT_SIZES.map(size => (
                            <MenuItem key={size.value} value={size.value}>
                              <Box>
                                <Typography variant="body1">{size.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {size.details}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.tshirt_size && (
                          <FormHelperText>{errors.tshirt_size}</FormHelperText>
                        )}
                      </StyledFormControl>
                      <Button
                        size="small"
                        startIcon={<StraightenIcon />}
                        onClick={() => setSizeChartOpen(true)}
                        sx={{ mt: 1 }}
                      >
                        View Size Chart
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
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
                    <StyledTextField
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
            </Collapse>
          </Card>

          {/* Payment Details — read-only summary (already captured in Step 1) */}
          <Card sx={{ mb: 2 }} data-section="payment">
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">Payment Details</Typography>
                  <StatusChip
                    label={isSectionComplete('payment') ? 'Completed' : 'Incomplete'}
                    className={isSectionComplete('payment') ? 'completed' : 'incomplete'}
                    icon={isSectionComplete('payment') ? <CheckCircleIcon /> : <ErrorIcon />}
                    size="small"
                  />
                </Box>
              }
              subheader="Entered in Step 1 — confirm below before submitting"
              action={
                <ExpandMore
                  expand={expandedSections.payment}
                  onClick={() => handleExpandSection('payment')}
                  aria-expanded={expandedSections.payment}
                  aria-label="show payment details"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              }
            />
            <Collapse in={expandedSections.payment}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Paid to</Typography>
                    <Typography variant="body1">{formData.paid_to || '—'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                    <Typography variant="body1">{formData.payment_transaction_id || '—'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">UPI ID / Phone used to pay</Typography>
                    <Typography variant="body1">{formData.payment_upi_id || '—'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Collapse>
          </Card>

          {/* Spacer so content is not hidden behind sticky submit bar (extra on mobile for safe area) */}
          <Box sx={{ height: { xs: 120, sm: 100 } }} />

            </>
          )}

        {/* Sticky Submit Bar — always visible; safe area and full-width button on mobile */}
        {paymentGateComplete && (
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              py: { xs: 1.5, sm: 2 },
              px: { xs: 1.5, sm: 2 },
              pb: { xs: 'max(12px, env(safe-area-inset-bottom))', sm: 2 },
              bgcolor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
              zIndex: 10,
            }}
          >
            <Container maxWidth="lg" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch', justifyContent: 'space-between', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}>
                  {canSubmit
                    ? 'All sections complete. Review and submit when ready.'
                    : 'Complete rules acknowledgment and all sections above to enable submit.'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' }, order: -1 }}>
                  {canSubmit ? 'Ready to submit.' : 'Complete all sections above to enable submit.'}
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!canSubmit}
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    minHeight: 44,
                    py: 1.5,
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </Box>
            </Container>
          </Box>
        )}
        </form>

        {/* Success Dialog */}
        <Dialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          maxWidth="md"
          fullWidth
          scroll="paper"
        >
          <DialogTitle sx={{ 
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'success.main',
            color: 'success.contrastText',
          }}>
            <DoneAllIcon />
            Registration Successful!
          </DialogTitle>
          <DialogContent className="print-content">
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon color="primary" />
                Registration Details
              </Typography>
              <Typography color="success.main" paragraph>
                Registration ID: {registrationId}
              </Typography>
              
              {getFormattedDetails().map((section, index) => (
                <Box key={section.title} sx={{ mb: index !== getFormattedDetails().length - 1 ? 3 : 0 }}>
                  <Typography 
                    variant="subtitle1" 
                    color="primary" 
                    sx={{ 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      pb: 0.5,
                      mb: 1,
                      fontWeight: 'medium'
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Grid container spacing={2}>
                    {section.items.map((item) => (
                      <Grid item xs={12} sm={6} key={item.label}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.label}
                        </Typography>
                        <Typography variant="body1">
                          {item.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}

              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.soft', borderRadius: 1 }} className="info-box">
                <Typography variant="body2" color="info.main">
                  Please save these details for future reference. You will need your Registration ID for 
                  any League-related communications.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }} className="no-print">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                setFormData(initialFormData);
                setErrors({});
                setRulesAcknowledged(false);
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                window.print();
              }}
              startIcon={<ReceiptLongIcon />}
            >
              Print Details
            </Button>
          </DialogActions>
        </Dialog>

        {/* Size Chart Dialog */}
        <SizeChartDialog />
      </Container>
    </ErrorBoundary>
  )
} 