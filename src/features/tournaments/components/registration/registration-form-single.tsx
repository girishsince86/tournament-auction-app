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
  useTheme,
  styled,
  Collapse,
  IconButton,
  IconButtonProps,
  Paper,
  Avatar,
  alpha,
  Checkbox,
  FormControlLabel,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RegistrationFormData, initialFormData } from '../../types/registration'
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
import Image from 'next/image'

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}))

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200]}`,
  '& .MuiTypography-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[900],
    fontWeight: 600,
  },
}))

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white,
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white,
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300],
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
  },
}))

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white,
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
  },
}))

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  fontSize: '1.125rem',
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

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

// Styled components for the expand more icon
interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

// Status chip component
const StatusChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  '&.completed': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  '&.incomplete': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

// Category card styling
const CategoryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${theme.palette.divider}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.5),
    '& .category-icon': {
      transform: 'scale(1.05)',
      backgroundColor: alpha(theme.palette.primary.main, 0.9),
    }
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      borderStyle: 'solid',
      borderWidth: '0 32px 32px 0',
      borderColor: `${theme.palette.primary.main} transparent transparent transparent`,
    },
    '& .category-icon': {
      backgroundColor: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
    '& .MuiTypography-subtitle1': {
      color: theme.palette.primary.main,
    },
    '&::after': {
      content: '"✓"',
      position: 'absolute',
      top: 2,
      right: 4,
      color: '#fff',
      fontSize: '14px',
      fontWeight: 'bold',
    }
  },
}));

const CategoryIcon = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: alpha(theme.palette.primary.main, 0.7),
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  className: 'category-icon',
  '& svg': {
    fontSize: '32px',
    transition: 'all 0.3s ease',
  },
}));

// Section types for type safety
type SectionName = 'category' | 'personal' | 'profile' | 'jersey' | 'payment';

// Add after the existing styled components
const PrintStyles = styled('style')({
  '@media print': {
    '@page': {
      size: 'A4',
      margin: '20mm',
    },
    '.no-print': {
      display: 'none !important',
    },
    '.MuiDialog-paper': {
      boxShadow: 'none !important',
    },
    '.MuiDialogTitle-root, .MuiTypography-root': {
      color: 'black !important',
    },
    '.MuiSvgIcon-root': {
      color: 'black !important',
    },
    '.print-content': {
      padding: '0 !important',
    },
    '.info-box': {
      backgroundColor: 'transparent !important',
      border: '1px solid black',
      padding: '16px',
    }
  },
});

export function RegistrationFormSingle() {
  const theme = useTheme()
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<SectionName, boolean>>({
    category: true,
    personal: false,
    profile: false,
    jersey: false,
    payment: false,
  })
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  })
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false)
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [registrationId, setRegistrationId] = useState<string>('')

  // Tournament Rules Content
  const tournamentRules = [
    {
      title: 'General Rules',
      rules: [
        'All players must be residents of PBEL City',
        'Players can only register for one category',
        'Players must arrive 15 minutes before their scheduled match time',
        'Tournament schedule will be shared after registration closes',
      ]
    },
    {
      title: 'Volleyball Rules',
      rules: [
        'Games will be played according to official volleyball rules',
        'Each match will be best of 3 sets',
        'First two sets will be played to 25 points',
        'Final set (if needed) will be played to 15 points',
        'Teams must win by 2 points in all sets',
      ]
    },
    {
      title: 'Throwball Rules',
      rules: [
        'Standard throwball rules apply',
        'Each match will consist of 3 sets',
        'Each set will be played to 25 points',
        'Service rotation is mandatory',
        'Double throw is not allowed',
      ]
    },
    {
      title: 'Code of Conduct',
      rules: [
        'Maintain sportsmanship at all times',
        'Respect officials\' decisions',
        'No inappropriate behavior or language',
        'Follow all safety protocols',
      ]
    },
  ]

  // Function to check section completion
  const isSectionComplete = (section: SectionName): boolean => {
    switch (section) {
      case 'category':
        return !!formData.registration_category && !errors.registration_category && rulesAcknowledged;
      case 'personal':
        return !!(
          formData.first_name &&
          formData.last_name &&
          formData.phone_number &&
          formData.flat_number
        ) && !errors.first_name && !errors.last_name && !errors.phone_number && !errors.flat_number;
      case 'profile':
        return !!(
          formData.height &&
          formData.last_played_date &&
          formData.skill_level &&
          formData.playing_positions.length
        ) && !errors.height && !errors.last_played_date && !errors.skill_level && !errors.playing_positions;
      case 'jersey':
        return !!(
          formData.tshirt_size &&
          formData.tshirt_name &&
          formData.tshirt_number
        ) && !errors.tshirt_size && !errors.tshirt_name && !errors.tshirt_number;
      case 'payment':
        return !!(
          formData.payment_upi_id &&
          formData.payment_transaction_id &&
          formData.paid_to
        ) && !errors.payment_upi_id && !errors.payment_transaction_id && !errors.paid_to;
      default:
        return false;
    }
  };

  // Handle section expansion
  const handleExpandSection = (section: SectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Auto-expand next incomplete section
  useEffect(() => {
    const sections: SectionName[] = ['category', 'personal', 'profile', 'jersey', 'payment'];
    const firstIncomplete = sections.find(section => !isSectionComplete(section));
    if (firstIncomplete) {
      setExpandedSections(prev => ({
        ...prev,
        [firstIncomplete]: true,
      }));
    }
  }, [formData, errors]);

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

  // Function to format the registration details for display
  const getFormattedDetails = () => [
    {
      title: 'Category Details',
      items: [
        { label: 'Tournament Category', value: REGISTRATION_CATEGORIES.find(c => c.value === formData.registration_category)?.label || '' },
      ]
    },
    {
      title: 'Personal Information',
      items: [
        { label: 'Name', value: `${formData.first_name} ${formData.last_name}` },
        { label: 'Phone Number', value: formData.phone_number },
        { label: 'Flat Number', value: formData.flat_number },
      ]
    },
    {
      title: 'Player Profile',
      items: [
        { label: 'Height', value: `${formData.height} cm` },
        { label: 'Last Played', value: LAST_PLAYED_OPTIONS.find(o => o.value === formData.last_played_date)?.label || '' },
        { label: 'Skill Level', value: SKILL_LEVELS.find(s => s.value === formData.skill_level)?.label || '' },
        { label: 'Playing Position', value: PLAYING_POSITIONS.find(p => p.value === formData.playing_positions[0])?.label || '' },
      ]
    },
    {
      title: 'Jersey Details',
      items: [
        { label: 'Jersey Size', value: formData.tshirt_size },
        { label: 'Jersey Name', value: formData.tshirt_name },
        { label: 'Jersey Number', value: formData.tshirt_number },
      ]
    },
    {
      title: 'Payment Information',
      items: [
        { label: 'UPI ID', value: formData.payment_upi_id },
        { label: 'Transaction ID', value: formData.payment_transaction_id },
        { label: 'Paid To', value: formData.paid_to },
      ]
    },
  ]

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      // Set registration ID and show success dialog
      setRegistrationId(data.registrationId)
      setShowSuccessDialog(true)
      
      // Show success snackbar
      setSnackbar({
        open: true,
        message: 'Registration successful! Please save your registration details for future reference.',
        severity: 'success'
      })

    } catch (error) {
      console.error('Registration error:', error)
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PrintStyles />
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

        {/* Form Header with Sports Image */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          position: 'relative',
          height: { xs: 420, sm: 380, md: 320 }, // Responsive height to prevent text overflow
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[4],
        }}>
          <Image
            src="/images/community-sports.jpg"
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: { xs: 2, sm: 3, md: 4 },
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              '& svg': {
                fontSize: { xs: 32, sm: 40, md: 48 },
                color: alpha('#fff', 0.9),
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
              }
            }}>
              <SportsVolleyballIcon />
              <EmojiEventsIcon />
              <SportsHandballIcon />
            </Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{
                fontWeight: 800,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 2,
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem' },
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                px: { xs: 1, sm: 2 },
                maxWidth: '100%',
                background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PBEL City VolleyBall and ThrowBall Tournament 2025
            </Typography>
            <Box sx={{ 
              width: { xs: 40, sm: 50, md: 60 }, 
              height: '4px', 
              bgcolor: alpha('#fff', 0.9),
              mb: { xs: 2, sm: 3 },
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }} />
            <Typography 
              variant="h6"
              sx={{ 
                mb: { xs: 2, sm: 3 },
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                fontWeight: 500,
                color: alpha('#fff', 0.95),
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                letterSpacing: '1px',
              }}
            >
              Bringing Our Community Together Through Sports
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: { xs: '95%', sm: 700, md: 800 },
                mx: 'auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                lineHeight: 1.6,
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                opacity: 0.9,
                px: { xs: 1, sm: 2 },
              }}
            >
              Welcome to PBEL City's premier sports event! Register below to participate in our annual tournament. 
              Whether you're a volleyball enthusiast or throwball player, join us for an exciting competition 
              that celebrates sportsmanship and community spirit.
            </Typography>
          </Box>
        </Box>

        {/* Tournament Rules Section */}
        <Card sx={{ mb: 2 }}>
          <CardHeader
            avatar={<GavelIcon color="primary" />}
            title="Tournament Rules & Guidelines"
            action={
              <Button
                startIcon={<ArticleIcon />}
                onClick={() => setRulesDialogOpen(true)}
                color="primary"
              >
                View Complete Rules
              </Button>
            }
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please read and acknowledge the tournament rules before proceeding with registration.
              The complete rulebook contains important information about match formats, scoring systems,
              and code of conduct.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rulesAcknowledged}
                  onChange={(e) => setRulesAcknowledged(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I have read and agree to follow the tournament rules and guidelines
                </Typography>
              }
            />
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
            Tournament Rules & Guidelines
          </DialogTitle>
          <DialogContent dividers>
            {tournamentRules.map((section, index) => (
              <Box key={section.title} sx={{ mb: index !== tournamentRules.length - 1 ? 4 : 0 }}>
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
        <Card sx={{ mb: 2 }}>
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
              <Grid container spacing={3}>
                {REGISTRATION_CATEGORIES.map((category) => (
                  <Grid item xs={12} sm={6} md={3} key={category.value}>
                    <CategoryCard 
                      className={formData.registration_category === category.value ? 'selected' : ''}
                      onClick={() => {
                        const event = {
                          target: { name: 'registration_category', value: category.value }
                        } as SelectChangeEvent;
                        handleSelectChange(event);
                      }}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        }
                      }}
                    >
                      <CategoryIcon className="category-icon">
                        {category.value.includes('VOLLEYBALL') ? (
                          <SportsVolleyballIcon />
                        ) : (
                          <SportsHandballIcon />
                        )}
                      </CategoryIcon>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="bold"
                        sx={{ 
                          transition: 'color 0.3s ease',
                          fontSize: '1rem',
                        }}
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
                            <PeopleIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} />
                            Mixed Category
                          </>
                        ) : category.value.includes('WOMEN') ? (
                          'Women Only'
                        ) : (
                          'Men Only'
                        )}
                      </Typography>
                    </CategoryCard>
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
        <Card sx={{ mb: 2 }}>
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
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange('phone_number')}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number || 'Format: +91XXXXXXXXXX'}
                    placeholder="+91XXXXXXXXXX"
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
              </Grid>
            </CardContent>
          </Collapse>
        </Card>

        {/* Player Profile */}
        <Card sx={{ mb: 2 }}>
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
                      inputProps: { min: 100, max: 250, step: 0.01 },
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
                <Grid item xs={12} sm={6}>
                  <StyledFormControl fullWidth error={!!errors.playing_positions} required>
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
                  </StyledFormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Collapse>
        </Card>

        {/* Jersey Details */}
        <Card sx={{ mb: 2 }}>
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
                  <StyledFormControl fullWidth error={!!errors.tshirt_size} required>
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
                  </StyledFormControl>
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

        {/* Payment Details */}
        <Card sx={{ mb: 2 }}>
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
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
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
                  <StyledTextField
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
                  <StyledTextField
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
          </Collapse>
        </Card>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={
              isSubmitting || 
              !(['category', 'personal', 'profile', 'jersey', 'payment'] as const)
                .every(section => isSectionComplete(section as SectionName))
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </Box>
      </Box>

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
                any tournament-related communications.
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
    </Container>
  )
} 