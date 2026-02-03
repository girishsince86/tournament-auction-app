'use client';

import { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Grid, 
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Paper,
    Divider,
    alpha,
    useTheme
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/navigation';
import { useTournaments } from '@/hooks/useTournaments';
import Image from 'next/image';
import Link from 'next/link';
import HandshakeIcon from '@mui/icons-material/Handshake';

export default function AuctionManagementPage() {
    const router = useRouter();
    const theme = useTheme();
    const { tournaments, currentTournament, isLoading, error } = useTournaments();
    const [selectedTournament, setSelectedTournament] = useState<string>('');

    // Set the selected tournament to current tournament when data is loaded
    useEffect(() => {
        if (currentTournament) {
            setSelectedTournament(currentTournament.id);
        }
    }, [currentTournament]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <div className="p-4">
            {/* PBL League Banner */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: 2,
                    background: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative', width: 60, height: 60 }}>
                        <Image
                            src="/pbel-volleyball-logo.png"
                            alt="PBL Volleyball Logo"
                            width={60}
                            height={60}
                            style={{ objectFit: 'contain' }}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            PBEL CIty VOLLEYBALL
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            AND THROWBALL LEAGUE 2026
                        </Typography>
                    </Box>
                </Box>
                
                <Button
                    component={Link}
                    href="/sponsors"
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<HandshakeIcon />}
                    sx={{ 
                        borderRadius: 2,
                        px: 2
                    }}
                >
                    View Sponsors
                </Button>
            </Paper>
            
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    mb: 2
                }}
            >
                Auction Management
                {currentTournament && selectedTournament === currentTournament.id && (
                    <Typography component="span" color="primary" sx={{ ml: 1 }}>
                        (Current Tournament)
                    </Typography>
                )}
            </Typography>
            
            <Divider sx={{ mb: 3 }} />

            {/* Tournament Selection */}
            <Box mb={4}>
                <FormControl fullWidth>
                    <InputLabel id="tournament-select-label">Select Tournament</InputLabel>
                    <Select
                        labelId="tournament-select-label"
                        value={selectedTournament}
                        label="Select Tournament"
                        onChange={(e) => setSelectedTournament(e.target.value)}
                    >
                        {tournaments.map((tournament) => (
                            <MenuItem 
                                key={tournament.id} 
                                value={tournament.id}
                                sx={tournament.id === currentTournament?.id ? { fontWeight: 'bold' } : {}}
                            >
                                {tournament.name}
                                {tournament.id === currentTournament?.id && ' (Current)'}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Auction Display Card */}
                <Grid item xs={12} md={6}>
                    <Card 
                        elevation={3}
                        sx={{ 
                            borderRadius: 2,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: theme.shadows[8]
                            }
                        }}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <VisibilityIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                                <Typography variant="h6">
                                    Auction Display
                                </Typography>
                            </Box>
                            <Typography color="text.secondary" paragraph>
                                View the auction display page that shows the current player, timer, and bidding status.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => router.push(`/auction/${selectedTournament}/display`)}
                                startIcon={<VisibilityIcon />}
                                disabled={!selectedTournament}
                                sx={{ 
                                    borderRadius: '20px',
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Open Display
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Auction Control Card */}
                <Grid item xs={12} md={6}>
                    <Card 
                        elevation={3}
                        sx={{ 
                            borderRadius: 2,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: theme.shadows[8]
                            }
                        }}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <SettingsIcon sx={{ mr: 2, color: theme.palette.secondary.main }} />
                                <Typography variant="h6">
                                    Auction Control
                                </Typography>
                            </Box>
                            <Typography color="text.secondary" paragraph>
                                Control the auction process, manage the queue, and record bids.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="secondary"
                                onClick={() => router.push(`/auction/${selectedTournament}/control`)}
                                startIcon={<SettingsIcon />}
                                disabled={!selectedTournament}
                                sx={{ 
                                    borderRadius: '20px',
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Open Control Panel
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {!selectedTournament && (
                <Alert severity="info" sx={{ mt: 4 }}>
                    Please select a tournament to manage its auction.
                </Alert>
            )}
        </div>
    );
} 