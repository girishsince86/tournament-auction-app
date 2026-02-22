'use client';

import { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    useTheme,
    alpha,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    Fade,
    Grow,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Gavel as AuctionIcon,
    Casino as SpinIcon,
    CheckCircle as CheckIcon,
    Edit as EditIcon,
    SportsVolleyball as VolleyballIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type Step = 'lookup' | 'consent' | 'success';
type LookupMode = 'phone' | 'email';
type ConsentChoice = 'AUCTION_POOL' | 'SPIN_THE_WHEEL';

interface PlayerInfo {
    id: string;
    name: string;
    phone_number: string;
    email: string | null;
}

interface ConsentInfo {
    id: string;
    consent_choice: ConsentChoice;
    created_at: string;
    updated_at: string;
}

export default function ConsentPage() {
    const theme = useTheme();

    // State
    const [step, setStep] = useState<Step>('lookup');
    const [lookupMode, setLookupMode] = useState<LookupMode>('phone');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [player, setPlayer] = useState<PlayerInfo | null>(null);
    const [consent, setConsent] = useState<ConsentInfo | null>(null);
    const [selectedChoice, setSelectedChoice] = useState<ConsentChoice | null>(null);

    // Lookup player by phone or email
    const handleLookup = async () => {
        if (!inputValue.trim()) {
            setError(`Please enter your ${lookupMode === 'phone' ? 'phone number' : 'email address'}`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const param = lookupMode === 'phone' ? `phone=${encodeURIComponent(inputValue.trim())}` : `email=${encodeURIComponent(inputValue.trim())}`;
            const res = await fetch(`/api/public/consent?${param}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Player not found');
                return;
            }

            setPlayer(data.player);

            if (data.consent) {
                // Player already submitted consent
                setConsent(data.consent);
                setSelectedChoice(data.consent.consent_choice);
                setStep('success');
            } else {
                setStep('consent');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Submit consent choice
    const handleSubmit = async () => {
        if (!selectedChoice || !player) return;

        setLoading(true);
        setError(null);

        try {
            const body: Record<string, string> = { consent_choice: selectedChoice };
            if (lookupMode === 'phone') {
                body.phone = inputValue.trim();
            } else {
                body.email = inputValue.trim();
            }

            const res = await fetch('/api/public/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit consent');
                return;
            }

            setConsent(data.consent);
            setStep('success');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset to start over
    const handleChangeChoice = () => {
        setStep('consent');
        setConsent(null);
    };

    const handleStartOver = () => {
        setStep('lookup');
        setInputValue('');
        setPlayer(null);
        setConsent(null);
        setSelectedChoice(null);
        setError(null);
    };

    // Card styles for consent options
    const getOptionCardSx = (choice: ConsentChoice) => ({
        p: 3,
        cursor: 'pointer',
        borderRadius: 3,
        border: `2px solid ${selectedChoice === choice ? (choice === 'AUCTION_POOL' ? '#0ea5e9' : '#f97316') : alpha(theme.palette.common.white, 0.1)}`,
        background: selectedChoice === choice
            ? (choice === 'AUCTION_POOL'
                ? 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)')
            : alpha(theme.palette.background.paper, 0.4),
        transition: 'all 0.3s ease',
        '&:hover': {
            borderColor: choice === 'AUCTION_POOL' ? '#0ea5e9' : '#f97316',
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${alpha(choice === 'AUCTION_POOL' ? '#0ea5e9' : '#f97316', 0.2)}`,
        },
    });

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 6 }, position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ mb: 2 }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box sx={{ position: 'relative', width: 60, height: 60 }}>
                            <Image
                                src="/pbel-volleyball-logo.png"
                                alt="PBL Logo"
                                width={60}
                                height={60}
                                style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                            />
                        </Box>
                    </Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                            background: 'linear-gradient(135deg, #0ea5e9, #f97316)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            mb: 1,
                            fontSize: { xs: '1.6rem', sm: '2.125rem' },
                        }}
                    >
                        TB Open Women
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: alpha(theme.palette.common.white, 0.7),
                            fontWeight: 400,
                            fontSize: { xs: '0.95rem', sm: '1.15rem' },
                        }}
                    >
                        Auction Consent Form
                    </Typography>
                </Box>
                <Divider
                    sx={{
                        width: '80px',
                        mx: 'auto',
                        borderWidth: 2,
                        borderImage: 'linear-gradient(90deg, #0ea5e9, #f97316) 1',
                    }}
                />
            </Box>

            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 1: Lookup */}
            {step === 'lookup' && (
                <Fade in>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 3,
                            background: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(16px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#fff' }}>
                            Verify Your Identity
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, color: alpha(theme.palette.common.white, 0.6) }}>
                            Enter your registered phone number or email to proceed
                        </Typography>

                        {/* Toggle phone / email */}
                        <ToggleButtonGroup
                            value={lookupMode}
                            exclusive
                            onChange={(_, val) => { if (val) { setLookupMode(val); setInputValue(''); setError(null); } }}
                            size="small"
                            sx={{
                                mb: 3,
                                width: '100%',
                                '& .MuiToggleButton-root': {
                                    flex: 1,
                                    color: alpha(theme.palette.common.white, 0.6),
                                    borderColor: alpha(theme.palette.common.white, 0.15),
                                    '&.Mui-selected': {
                                        color: '#0ea5e9',
                                        borderColor: '#0ea5e9',
                                        bgcolor: alpha('#0ea5e9', 0.1),
                                    },
                                },
                            }}
                        >
                            <ToggleButton value="phone">
                                <PhoneIcon sx={{ mr: 1, fontSize: 18 }} /> Phone
                            </ToggleButton>
                            <ToggleButton value="email">
                                <EmailIcon sx={{ mr: 1, fontSize: 18 }} /> Email
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            fullWidth
                            label={lookupMode === 'phone' ? 'Phone Number' : 'Email Address'}
                            placeholder={lookupMode === 'phone' ? 'Enter your 10-digit phone number' : 'Enter your registered email'}
                            type={lookupMode === 'phone' ? 'tel' : 'email'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleLookup}
                            disabled={loading || !inputValue.trim()}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
                        </Button>
                    </Paper>
                </Fade>
            )}

            {/* Step 2: Consent Form */}
            {step === 'consent' && player && (
                <Fade in>
                    <Box>
                        {/* Player info */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                mb: 3,
                                borderRadius: 3,
                                background: alpha(theme.palette.background.paper, 0.5),
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0ea5e9, #f97316)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <VolleyballIcon sx={{ color: '#fff', fontSize: 26 }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#fff' }}>
                                    {player.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.5) }}>
                                    TB Open Women
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Question */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: 3,
                                background: alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 3, color: alpha(theme.palette.common.white, 0.85), lineHeight: 1.6 }}>
                                In the event we introduce auction process for team formation in Open Category Women TB, please select the option you would like to opt for:
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                                {/* Option 1: Auction Pool */}
                                <Paper
                                    elevation={0}
                                    onClick={() => setSelectedChoice('AUCTION_POOL')}
                                    sx={getOptionCardSx('AUCTION_POOL')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                                background: selectedChoice === 'AUCTION_POOL'
                                                    ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                                                    : alpha(theme.palette.common.white, 0.05),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <AuctionIcon sx={{ color: selectedChoice === 'AUCTION_POOL' ? '#fff' : alpha(theme.palette.common.white, 0.4), fontSize: 24 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                                                Auction Pool
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6), lineHeight: 1.5 }}>
                                                I would like to be part of auction pool before being forwarded to Spin the Wheel based random assignment to a team.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>

                                {/* Option 2: Spin the Wheel */}
                                <Paper
                                    elevation={0}
                                    onClick={() => setSelectedChoice('SPIN_THE_WHEEL')}
                                    sx={getOptionCardSx('SPIN_THE_WHEEL')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                                background: selectedChoice === 'SPIN_THE_WHEEL'
                                                    ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                                    : alpha(theme.palette.common.white, 0.05),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <SpinIcon sx={{ color: selectedChoice === 'SPIN_THE_WHEEL' ? '#fff' : alpha(theme.palette.common.white, 0.4), fontSize: 24 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                                                Spin the Wheel
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6), lineHeight: 1.5 }}>
                                                I would like to skip being part of auction pool and directly be considered for Spin the Wheel based team allocation.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={loading || !selectedChoice}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    background: selectedChoice === 'SPIN_THE_WHEEL'
                                        ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                        : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                    transition: 'background 0.3s ease',
                                    '&:hover': {
                                        background: selectedChoice === 'SPIN_THE_WHEEL'
                                            ? 'linear-gradient(135deg, #fb923c, #f97316)'
                                            : 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit My Choice'}
                            </Button>

                            <Button
                                fullWidth
                                variant="text"
                                size="small"
                                onClick={handleStartOver}
                                sx={{ mt: 1.5, color: alpha(theme.palette.common.white, 0.4) }}
                            >
                                ← Go Back
                            </Button>
                        </Paper>
                    </Box>
                </Fade>
            )}

            {/* Step 3: Success */}
            {step === 'success' && player && consent && (
                <Grow in>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 3,
                            background: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(16px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            component={motion.div}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                            sx={{ mb: 3 }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
                                }}
                            >
                                <CheckIcon sx={{ color: '#fff', fontSize: 44 }} />
                            </Box>
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                            Response Recorded!
                        </Typography>
                        <Typography variant="body1" sx={{ color: alpha(theme.palette.common.white, 0.6), mb: 3 }}>
                            Thank you, {player.name}. Your preference has been saved.
                        </Typography>

                        {/* Selected choice - big bold display */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                mb: 3,
                                borderRadius: 3,
                                border: `2px solid ${consent.consent_choice === 'AUCTION_POOL' ? '#0ea5e9' : '#f97316'}`,
                                background: consent.consent_choice === 'AUCTION_POOL'
                                    ? 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0.05) 100%)'
                                    : 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                {consent.consent_choice === 'AUCTION_POOL'
                                    ? <AuctionIcon sx={{ fontSize: 48, color: '#38bdf8' }} />
                                    : <SpinIcon sx={{ fontSize: 48, color: '#fb923c' }} />}
                            </Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    color: consent.consent_choice === 'AUCTION_POOL' ? '#38bdf8' : '#fb923c',
                                    mb: 2,
                                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                }}
                            >
                                {consent.consent_choice === 'AUCTION_POOL' ? 'Auction Pool' : 'Spin the Wheel'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha(theme.palette.common.white, 0.7), lineHeight: 1.7 }}>
                                {consent.consent_choice === 'AUCTION_POOL'
                                    ? 'You opted to be part of the auction pool before being forwarded to Spin the Wheel based random assignment to a team.'
                                    : 'You opted to skip the auction pool and directly be considered for Spin the Wheel based team allocation.'}
                            </Typography>
                        </Box>

                        {/* Timestamp */}
                        <Typography variant="caption" sx={{ display: 'block', mb: 3, color: alpha(theme.palette.common.white, 0.4) }}>
                            Submitted on{' '}
                            {new Date(consent.updated_at || consent.created_at).toLocaleString('en-IN', {
                                dateStyle: 'long',
                                timeStyle: 'short',
                                timeZone: 'Asia/Kolkata',
                            })}
                        </Typography>

                        <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.common.white, 0.08) }} />

                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            startIcon={<EditIcon />}
                            onClick={handleChangeChoice}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                borderColor: alpha(theme.palette.common.white, 0.2),
                                color: alpha(theme.palette.common.white, 0.7),
                                '&:hover': {
                                    borderColor: alpha(theme.palette.common.white, 0.4),
                                    bgcolor: alpha(theme.palette.common.white, 0.05),
                                },
                            }}
                        >
                            Change My Choice
                        </Button>
                    </Paper>
                </Grow>
            )}
        </Container>
    );
}
