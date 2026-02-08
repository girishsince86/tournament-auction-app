'use client'

import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    Avatar,
    alpha,
    useTheme,
    useMediaQuery,
    IconButton,
    Chip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonIcon from '@mui/icons-material/Person'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PaymentIcon from '@mui/icons-material/Payment'
import CategoryIcon from '@mui/icons-material/Category'
import { RegistrationFormData, isYouthCategory } from '../../types/registration'
import { SectionName } from './registration-constants'
import {
    REGISTRATION_CATEGORIES,
    SKILL_LEVELS,
    LAST_PLAYED_OPTIONS,
    PLAYING_POSITIONS,
} from './registration-constants'
import { categoryRequiresDoB } from './registration-age'
import { isVolleyballCategory } from './registration-validation'

interface RegistrationReviewStepProps {
    formData: RegistrationFormData
    profileImagePreviewUrl: string | null
    onEdit: (section?: SectionName) => void
    onSubmit: () => void
    isSubmitting: boolean
}

interface ReviewRowProps {
    label: string
    value: string | number | null | undefined
}

function ReviewRow({ label, value }: ReviewRowProps) {
    if (!value && value !== 0) return null
    return (
        <Box sx={{ py: 0.75 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value}
            </Typography>
        </Box>
    )
}

interface ReviewSectionCardProps {
    title: string
    icon: React.ReactNode
    section: SectionName
    onEdit: (section: SectionName) => void
    children: React.ReactNode
}

function ReviewSectionCard({ title, icon, section, onEdit, children }: ReviewSectionCardProps) {
    const theme = useTheme()

    return (
        <Card
            sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:active': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
            }}
        >
            <CardContent sx={{ pb: '12px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            {icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {title}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => onEdit(section)}
                        sx={{
                            color: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                            },
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Box sx={{ pl: 0.5 }}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    )
}

export function RegistrationReviewStep({
    formData,
    profileImagePreviewUrl,
    onEdit,
    onSubmit,
    isSubmitting,
}: RegistrationReviewStepProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const categoryLabel = REGISTRATION_CATEGORIES.find(c => c.value === formData.registration_category)?.label || formData.registration_category
    const skillLabel = SKILL_LEVELS.find(l => l.value === formData.skill_level)?.label || formData.skill_level
    const lastPlayedLabel = LAST_PLAYED_OPTIONS.find(o => o.value === formData.last_played_date)?.label || formData.last_played_date
    const positionsLabel = formData.playing_positions?.map(p =>
        PLAYING_POSITIONS.find(pos => pos.value === p)?.label || p
    ).join(', ')

    const isVolleyball = isVolleyballCategory(formData.registration_category)
    const isYouth = isYouthCategory(formData.registration_category)
    const requiresDoB = categoryRequiresDoB(formData.registration_category)

    return (
        <Box sx={{
            minHeight: '100vh',
            pb: { xs: 16, sm: 12 },
        }}>
            {/* Header */}
            <Box sx={{
                textAlign: 'center',
                py: 3,
                px: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Review Your Registration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Please review all details before submitting
                </Typography>
            </Box>

            <Container maxWidth="sm" sx={{ pt: 2, px: { xs: 2, sm: 3 } }}>
                {/* Profile Card */}
                <Card sx={{
                    mb: 2,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    overflow: 'visible',
                }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Avatar
                            src={profileImagePreviewUrl || undefined}
                            sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 2,
                                border: '3px solid white',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                            }}
                        >
                            {formData.first_name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                            {formData.first_name} {formData.last_name}
                        </Typography>
                        <Chip
                            label={categoryLabel}
                            size="small"
                            sx={{
                                mt: 1,
                                bgcolor: alpha('#fff', 0.2),
                                color: 'white',
                                fontWeight: 500,
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Category Selection */}
                <ReviewSectionCard
                    title="Category Selection"
                    icon={<CategoryIcon />}
                    section="category"
                    onEdit={onEdit}
                >
                    <ReviewRow label="League Category" value={categoryLabel} />
                </ReviewSectionCard>

                {/* Personal Details */}
                <ReviewSectionCard
                    title="Personal Details"
                    icon={<PersonIcon />}
                    section="personal"
                    onEdit={onEdit}
                >
                    <ReviewRow label="Email" value={formData.email} />
                    <ReviewRow label="Phone" value={formData.phone_number} />
                    <ReviewRow label="Flat Number" value={formData.flat_number} />
                    {requiresDoB && (
                        <ReviewRow
                            label="Date of Birth"
                            value={formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('en-IN') : undefined}
                        />
                    )}
                    {isYouth && (
                        <>
                            <ReviewRow label="Parent/Guardian Name" value={formData.parent_name} />
                            <ReviewRow label="Parent/Guardian Phone" value={formData.parent_phone_number} />
                        </>
                    )}
                </ReviewSectionCard>

                {/* Player Profile */}
                <ReviewSectionCard
                    title="Player Profile"
                    icon={<SportsVolleyballIcon />}
                    section="profile"
                    onEdit={onEdit}
                >
                    <ReviewRow label="Skill Level" value={skillLabel} />
                    <ReviewRow label="Last Played" value={lastPlayedLabel} />
                    {formData.height && <ReviewRow label="Height" value={`${formData.height} cm`} />}
                    {isVolleyball && positionsLabel && (
                        <ReviewRow label="Playing Positions" value={positionsLabel} />
                    )}
                </ReviewSectionCard>

                {/* Jersey Details */}
                <ReviewSectionCard
                    title="Jersey Details"
                    icon={<CheckroomIcon />}
                    section="jersey"
                    onEdit={onEdit}
                >
                    <ReviewRow label="T-Shirt Size" value={formData.tshirt_size} />
                    {formData.tshirt_name && <ReviewRow label="Name on Jersey" value={formData.tshirt_name} />}
                    {formData.tshirt_number && <ReviewRow label="Jersey Number" value={formData.tshirt_number} />}
                </ReviewSectionCard>

                {/* Payment Details */}
                <ReviewSectionCard
                    title="Payment Details"
                    icon={<PaymentIcon />}
                    section="payment"
                    onEdit={onEdit}
                >
                    <ReviewRow label="Paid To" value={formData.paid_to} />
                    <ReviewRow label="Transaction ID" value={formData.payment_transaction_id} />
                    <ReviewRow label="UPI ID / Phone" value={formData.payment_upi_id} />
                </ReviewSectionCard>
            </Container>

            {/* Sticky Bottom Bar */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 2, sm: 3 },
                    pb: { xs: 'max(12px, env(safe-area-inset-bottom))', sm: 2 },
                    bgcolor: 'background.paper',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                    zIndex: 100,
                }}
            >
                <Container maxWidth="sm" disableGutters>
                    <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        flexDirection: { xs: 'column', sm: 'row' },
                    }}>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => onEdit()}
                            disabled={isSubmitting}
                            sx={{
                                flex: { xs: 'none', sm: 1 },
                                minHeight: 48,
                            }}
                        >
                            Back to Edit
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<CheckCircleIcon />}
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            sx={{
                                flex: { xs: 'none', sm: 2 },
                                minHeight: 48,
                                fontWeight: 600,
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    )
}
