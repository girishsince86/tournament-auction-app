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
import { useSearchParams, useRouter } from 'next/navigation'
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
import Image from 'next/image'
import { RegistrationCategory as AdminRegistrationCategory } from '@/features/admin/types/registration-admin'
import { ErrorBoundary } from '@/components/error-boundary'
import { useRegistrationSubmit } from '@/features/tournaments/hooks/use-registration-submit'

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

const PAYMENT_RECEIVERS = [
  { value: 'Vasu Chepuru', label: 'Vasu Chepuru (9849521594)' },
  { value: 'Amit Saxena', label: 'Amit Saxena (9866674460)' },
]

const TSHIRT_SIZES = [
  { value: 'XS', label: 'XS (34")', details: 'Chest: 34", Length: 24", Sleeve: 7.5"' },
  { value: 'S', label: 'S (36")', details: 'Chest: 36", Length: 25", Sleeve: 8"' },
  { value: 'M', label: 'M (38")', details: 'Chest: 38", Length: 26", Sleeve: 8"' },
  { value: 'L', label: 'L (40")', details: 'Chest: 40", Length: 27", Sleeve: 8.5"' },
  { value: 'XL', label: 'XL (42")', details: 'Chest: 42", Length: 28", Sleeve: 8.5"' },
  { value: '2XL', label: '2XL (44")', details: 'Chest: 44", Length: 29", Sleeve: 9"' },
  { value: '3XL', label: '3XL (46")', details: 'Chest: 46", Length: 30", Sleeve: 10"' },
] as const;

const REGISTRATION_CATEGORIES = [
  { value: 'VOLLEYBALL_OPEN_MEN', label: 'Volleyball - Open' },
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const { submitForm } = useRegistrationSubmit()
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
  const [residencyConfirmed, setResidencyConfirmed] = useState(false)
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [registrationId, setRegistrationId] = useState<string>('')
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

  // Tournament Rules Content
  const tournamentRules = [
    {
      title: 'Categories & Registration',
      rules: [
        'Categories: Volleyball - Open, Women\'s Throwball, Throwball 8-12 Mixed, Throwball 13-17 Mixed',
        'Only PBEL City residents can participate',
        'Individual registrations only (no team registrations)',
        'Players can register for only one category',
        'Registration fee: INR 600 per player',
        'Registration deadline strictly enforced',
        'No late registrations accepted',
      ]
    },
    {
      title: 'Age Requirements',
      rules: [
        'Throwball 8-12 Mixed: Must be born on or after May 1, 2012',
        'Throwball 13-17 Mixed: Must be born on or after May 1, 2008',
        'Parent/Guardian information required for youth categories',
        'Age verification may be required during the tournament',
      ]
    },
    {
      title: 'Team Formation',
      rules: [
        'Volleyball - Open:',
        '• Players will be drafted through skill-based allocation',
        '• Teams formed considering playing positions and experience',
        'Throwball Categories:',
        '• Teams formed through balanced distribution of skill levels',
        '• Random allocation within skill groups',
      ]
    },
    {
      title: 'Jersey & Equipment',
      rules: [
        'Each player receives a tournament jersey',
        'Jersey numbers may need to be revised after team formation to avoid conflicts',
        'Team captains will coordinate jersey number changes if needed',
        'Jersey name customization available',
        'Size options available from XS(34") to 3XL(46") with detailed measurements',
      ]
    },
    {
      title: 'Match Rules & Conduct',
      rules: [
        'Teams must arrive 15 minutes before scheduled match time',
        'Teams must maintain sportsmanlike conduct',
        'Referee decisions are final',
      ]
    },
    {
      title: 'Medical & Safety',
      rules: [
        'Basic first aid will be available at venue',
        'Players participate at their own risk',
        'Report any injuries to tournament officials immediately',
      ]
    },
    {
      title: 'Communication & Administration',
      rules: [
        'Official WhatsApp group for tournament updates',
        'Schedule changes will be notified 24 hours in advance',
        'Team captains responsible for relay of information',
        'Organizing Committee reserves rights to verify residency, modify rules, take disciplinary action, and adjust schedule',
        'All decisions by the organizing committee are final',
      ]
    },
  ]

  // Add this helper function near the top with other helper functions
  const isVolleyballCategory = (category: string | undefined): boolean => {
    return category?.includes('VOLLEYBALL') || false;
  };

  // Function to check section completion
  const isSectionComplete = (section: SectionName): boolean => {
    switch (section) {
      case 'category':
        return !!formData.registration_category && !errors.registration_category;
      case 'personal':
        const baseFieldsComplete = !!(
          formData.first_name &&
          formData.last_name &&
          formData.email &&
          formData.phone_number &&
          formData.flat_number
        ) && !errors.first_name && !errors.last_name && !errors.email && !errors.phone_number && !errors.flat_number;

        if (isYouthCategory(formData.registration_category)) {
          return baseFieldsComplete && !!(
            formData.date_of_birth &&
            formData.parent_name &&
            formData.parent_phone_number
          ) && !errors.date_of_birth && !errors.parent_name && !errors.parent_phone_number;
        }
        
        return baseFieldsComplete;
      case 'profile':
        const baseProfileFieldsComplete = !!(
          formData.height &&
          formData.last_played_date &&
          formData.skill_level
        ) && !errors.height && !errors.last_played_date && !errors.skill_level;

        if (isVolleyballCategory(formData.registration_category)) {
          return baseProfileFieldsComplete && !!(formData.playing_positions.length) && !errors.playing_positions;
        }
        return baseProfileFieldsComplete;
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
    const startTime = performance.now()
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
    console.log(`Section ${section} expansion took ${performance.now() - startTime}ms`)
  }

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

  // Handle input changes
  const processPhoneNumber = (value: string): string => {
    // Remove any non-digit characters except the '+' prefix
    const digitsOnly = value.replace(/[^\d+]/g, '')
    
    // Ensure the +91 prefix
    if (!digitsOnly.startsWith('+91')) {
      // If user is typing digits without prefix, add it
      if (digitsOnly.length > 0 && !digitsOnly.startsWith('+')) {
        return '+91' + digitsOnly
      }
      return digitsOnly
    }
    
    // Limit to +91 plus 10 digits
    if (digitsOnly.startsWith('+91')) {
      const remainingDigits = digitsOnly.substring(3)
      if (remainingDigits.length > 10) {
        return '+91' + remainingDigits.substring(0, 10)
      }
    }
    
    return digitsOnly
  }

  // Add this helper function to find the next incomplete section
  const findNextIncompleteSection = (): SectionName | null => {
    const sections: SectionName[] = ['category', 'personal', 'profile', 'jersey', 'payment'];
    return sections.find(section => !isSectionComplete(section)) || null;
  };

  // Update this function to keep sections expanded
  const handleSectionCompletion = (currentSection: SectionName) => {
    if (isSectionComplete(currentSection)) {
      const nextIncomplete = findNextIncompleteSection();
      if (nextIncomplete) {
        // Only expand the next section, don't collapse the current one
        setExpandedSections(prev => ({
          ...prev,
          [nextIncomplete]: true
        }));
        
        // Scroll to next section
        const nextSectionElement = document.querySelector(`[data-section="${nextIncomplete}"]`);
        if (nextSectionElement) {
          nextSectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  // Update handleChange to check for section completion
  const handleChange = (field: keyof RegistrationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    // Special handling for phone numbers
    if (field === 'phone_number' || field === 'parent_phone_number') {
      value = processPhoneNumber(value)
    }

    // Special handling for date of birth
    if (field === 'date_of_birth') {
      // Ensure the date is in ISO format for storage
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        value = date.toISOString().split('T')[0]
      }
    }

    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    setFormData(prev => ({ ...prev, [field]: value }));

    // Find which section this field belongs to
    const sectionMap: Record<string, SectionName> = {
      registration_category: 'category',
      first_name: 'personal',
      last_name: 'personal',
      email: 'personal',
      phone_number: 'personal',
      flat_number: 'personal',
      date_of_birth: 'personal',
      parent_name: 'personal',
      parent_phone_number: 'personal',
      height: 'profile',
      last_played_date: 'profile',
      skill_level: 'profile',
      playing_positions: 'profile',
      tshirt_size: 'jersey',
      tshirt_name: 'jersey',
      tshirt_number: 'jersey',
      payment_upi_id: 'payment',
      payment_transaction_id: 'payment',
      paid_to: 'payment',
    };

    // Check if section is complete after a short delay to allow state updates
    setTimeout(() => {
      const section = sectionMap[field];
      if (section) {
        handleSectionCompletion(section);
      }
    }, 100);

    // If changing category, validate youth-specific fields
    if (field === 'registration_category') {
      const isYouth = isYouthCategory(value as RegistrationCategory)
      if (isYouth) {
        ['date_of_birth', 'parent_name', 'parent_phone_number'].forEach(youthField => {
          const youthError = validateField(
            youthField as keyof RegistrationFormData,
            formData[youthField as keyof RegistrationFormData]
          )
          setErrors(prev => ({ ...prev, [youthField]: youthError }))
        })
      } else {
        // Clear youth-specific fields and errors when switching to non-youth category
        setFormData(prev => ({
          ...prev,
          date_of_birth: '',
          parent_name: '',
          parent_phone_number: ''
        }))
        setErrors(prev => ({
          ...prev,
          date_of_birth: '',
          parent_name: '',
          parent_phone_number: ''
        }))
      }
    }
  }

  // Update handleSelectChange similarly
  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    const { name, value } = event.target;
    const error = validateField(name as keyof RegistrationFormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setFormData(prev => ({ ...prev, [name]: value }));

    // Find which section this field belongs to
    const sectionMap: Record<string, SectionName> = {
      registration_category: 'category',
      skill_level: 'profile',
      last_played_date: 'profile',
      playing_positions: 'profile',
      tshirt_size: 'jersey',
      paid_to: 'payment',
    };

    // Check if section is complete after a short delay
    setTimeout(() => {
      const section = sectionMap[name];
      if (section) {
        handleSectionCompletion(section);
      }
    }, 100);
  };

  // Validation functions
  const validateField = (name: keyof RegistrationFormData, value: any): string => {
    const startTime = performance.now()
    let error = ''
    
    // Skip validation for optional fields if they're empty
    if (!value && !['registration_category', 'first_name', 'last_name', 'email', 'phone_number', 'flat_number', 'height', 'last_played_date', 'skill_level', 'tshirt_size', 'tshirt_name', 'tshirt_number', 'payment_upi_id', 'payment_transaction_id', 'paid_to'].includes(name)) {
      return '';
    }

    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value || value.trim().length < 2) {
          return `Please enter a valid ${name === 'first_name' ? 'first' : 'last'} name (minimum 2 characters)`;
        }
        return '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value || !emailRegex.test(value)) {
          return 'Please enter a valid email address'
        }
        return ''
      case 'phone_number':
        const phoneNumberWithoutPrefix = value.replace(/^\+91/, '').replace(/\s+/g, '')
        if (!phoneNumberWithoutPrefix.match(/^\d{10}$/)) {
          return 'Please enter a valid 10-digit phone number'
        }
        return ''
      case 'parent_phone_number':
        if (isYouthCategory(formData.registration_category)) {
          const parentPhoneNumberWithoutPrefix = value.replace(/^\+91/, '').replace(/\s+/g, '')
          if (!parentPhoneNumberWithoutPrefix.match(/^\d{10}$/)) {
            return 'Please enter a valid 10-digit phone number for parent'
          }
        }
        return ''
      case 'flat_number':
        if (!value || !value.trim().match(/^[A-Z0-9-]{1,10}$/i)) {
          return 'Please enter a valid flat number (e.g., A-123)';
        }
        return '';
      case 'height':
        const heightNum = Number(value);
        if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
          return 'Please enter a valid height in centimeters (100-250)';
        }
        return '';
      case 'registration_category':
        if (!value || !Object.values(RegistrationCategory).includes(value)) {
          return 'Please select a registration category';
        }
        return '';
      case 'last_played_date':
        if (!value || !LAST_PLAYED_OPTIONS.some(opt => opt.value === value)) {
          return 'Please select when you last played';
        }
        return '';
      case 'skill_level':
        if (!value || !SKILL_LEVELS.some(level => level.value === value)) {
          return 'Please select your skill level';
        }
        return '';
      case 'playing_positions':
        if (isVolleyballCategory(formData.registration_category) && (!Array.isArray(value) || value.length === 0)) {
          return 'Please select at least one playing position';
        }
        return '';
      case 'tshirt_size':
        if (!value || !TSHIRT_SIZES.some(size => size.value === value)) {
          return 'Please select a t-shirt size';
        }
        return '';
      case 'tshirt_name':
        if (!value || value.trim().length < 2 || value.trim().length > 15) {
          return 'Please enter a valid name for your jersey (2-15 characters)';
        }
        return '';
      case 'tshirt_number':
        const numberValue = Number(value);
        if (isNaN(numberValue) || numberValue < 1 || numberValue > 99) {
          return 'Please enter a valid jersey number (1-99)';
        }
        return '';
      case 'payment_upi_id':
        if (!value) {
          return 'Please enter your UPI ID or phone number';
        }
        return '';
      case 'payment_transaction_id':
        if (!value) {
          return 'Please enter the transaction ID';
        }
        return '';
      case 'paid_to':
        if (!value || !PAYMENT_RECEIVERS.some(receiver => receiver.value === value)) {
          return 'Please select who you paid to';
        }
        return '';
      case 'date_of_birth':
        if (isYouthCategory(formData.registration_category)) {
          if (!value) {
            return 'Date of birth is required'
          }
          const dob = new Date(value)
          const cutoffDate = new Date('2025-04-30')
          const age = cutoffDate.getFullYear() - dob.getFullYear()
          const monthDiff = cutoffDate.getMonth() - dob.getMonth()
          const finalAge = monthDiff < 0 || (monthDiff === 0 && cutoffDate.getDate() < dob.getDate()) 
            ? age - 1 
            : age

          if (formData.registration_category === 'THROWBALL_8_12_MIXED') {
            if (finalAge < 8) {
              return 'Player must be at least 8 years old as of April 30, 2025'
            }
            if (finalAge > 12) {
              return 'Player must be under 12 years old as of April 30, 2025'
            }
          }
          if (formData.registration_category === 'THROWBALL_13_17_MIXED') {
            if (finalAge < 13) {
              return 'Player must be at least 13 years old as of April 30, 2025'
            }
            if (finalAge > 17) {
              return 'Player must be under 17 years old as of April 30, 2025'
            }
          }
        } else {
          // For non-youth categories (Volleyball Open and Women's Throwball)
          if (value) {
            const dob = new Date(value)
            const cutoffDate = new Date('2025-04-30')
            const age = cutoffDate.getFullYear() - dob.getFullYear()
            const monthDiff = cutoffDate.getMonth() - dob.getMonth()
            const finalAge = monthDiff < 0 || (monthDiff === 0 && cutoffDate.getDate() < dob.getDate()) 
              ? age - 1 
              : age

            if (finalAge < 8) {
              return 'Player must be at least 8 years old as of April 30, 2025'
            }
          }
        }
        return ''
      case 'parent_name':
        if (isYouthCategory(formData.registration_category)) {
          if (!value || value.trim().length < 2) {
            return 'Please enter a valid parent/guardian name';
          }
        }
        return '';
      default:
        return '';
    }
    
    console.log(`Validation for ${name} took ${performance.now() - startTime}ms`)
    return error
  };

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
        { label: 'Email', value: formData.email },
        { label: 'Phone Number', value: formData.phone_number },
        { label: 'Flat Number', value: formData.flat_number },
        ...(isYouthCategory(formData.registration_category) ? [
          { label: 'Date of Birth', value: formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : '' },
          { label: 'Parent/Guardian Name', value: formData.parent_name },
          { label: 'Parent/Guardian Phone', value: formData.parent_phone_number },
        ] : []),
      ]
    },
    {
      title: 'Player Profile',
      items: [
        { label: 'Height', value: `${formData.height} cm` },
        { label: 'Last Played', value: LAST_PLAYED_OPTIONS.find(o => o.value === formData.last_played_date)?.label || '' },
        { label: 'Skill Level', value: SKILL_LEVELS.find(s => s.value === formData.skill_level)?.label || '' },
        ...(isVolleyballCategory(formData.registration_category) ? [
          { label: 'Playing Position', value: PLAYING_POSITIONS.find(p => p.value === formData.playing_positions[0])?.label || '' },
        ] : []),
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
        { label: 'UPI ID/ Phone Number of the Payee', value: formData.payment_upi_id },
        { label: 'Transaction ID', value: formData.payment_transaction_id },
        { label: 'Paid To', value: formData.paid_to },
      ]
    },
  ]

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    const submitStartTime = performance.now()
    console.log('Starting form submission process...')
    
    event.preventDefault()
    
    // Validation timing
    const validationStartTime = performance.now()
    const validationErrors = Object.keys(formData).reduce((errors: Record<string, string>, field) => {
      const error = validateField(field as keyof RegistrationFormData, formData[field as keyof RegistrationFormData])
      if (error) errors[field] = error
      return errors
    }, {})
    console.log(`Form validation took ${performance.now() - validationStartTime}ms`)

    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors found:', validationErrors)
      setErrors(validationErrors)
      return
    }

    if (!rulesAcknowledged || !residencyConfirmed) {
      setSnackbar({
        open: true,
        message: 'Please acknowledge the rules and confirm your residency',
        severity: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true)
      
      // Submit form
      const submissionStartTime = performance.now()
      await submitForm(formData)
      console.log(`Form submission to API took ${performance.now() - submissionStartTime}ms`)
      
    } catch (error) {
      console.error('Form submission error:', error)
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to submit registration',
        severity: 'error',
      })
    } finally {
      setIsSubmitting(false)
      console.log(`Total form process took ${performance.now() - submitStartTime}ms`)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
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
  )

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
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

          {/* Payment Instructions Alert */}
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%'
              },
              '& .MuiTypography-root': {
                color: 'text.primary'
              }
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 1, color: 'warning.dark' }}>
                Payment Required
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
                Registration fee: INR 600
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  Payment Options:
                </Typography>
                <Box sx={{ pl: 2, mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>• Vasu Chepuru (9849521594)</Typography>
                  <Typography variant="body1">• Amit Saxena (9866674460)</Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'warning.dark',
                    bgcolor: 'warning.light',
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  Important: You must complete the payment and have the transaction details ready before proceeding with the registration.
                </Typography>
              </Box>
            </Box>
          </Alert>

          {/* Form Header with Sports Image */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            position: 'relative',
            height: { xs: 420, sm: 380, md: 320 },
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
                  PBEL City VolleyBall and ThrowBall League 2025
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

          {/* Tournament Rules Section */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              avatar={<GavelIcon color="primary" />}
              title="League Rules & Guidelines"
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
                Please read and acknowledge the League rules before proceeding with registration.
                The complete rulebook contains important information about match formats, scoring systems,
                and code of conduct.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      I confirm that I am a resident of PBEL City at the time of registration and will be a resident 
                      of PBEL City for the entire duration of this league
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

          {/* Payment Details */}
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
                      label="UPI ID/ Phone Number of the Payee"
                      value={formData.payment_upi_id}
                      onChange={handleChange('payment_upi_id')}
                      error={!!errors.payment_upi_id}
                      helperText={errors.payment_upi_id}
                      placeholder="username@upi or phone number"
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
                    <StyledFormControl fullWidth error={!!errors.paid_to} required>
                      <InputLabel>Paid To</InputLabel>
                      <Select
                        name="paid_to"
                        value={formData.paid_to}
                        label="Paid To"
                        onChange={handleSelectChange}
                      >
                        {PAYMENT_RECEIVERS.map(receiver => (
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
                !rulesAcknowledged ||
                !residencyConfirmed ||
                !(['category', 'personal', 'profile', 'jersey', 'payment'] as const)
                  .every(section => isSectionComplete(section as SectionName))
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </Box>
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