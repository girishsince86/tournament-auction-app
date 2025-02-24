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
    CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter } from 'next/navigation';
import { useTournaments } from '@/hooks/useTournaments';

export default function AuctionManagementPage() {
    const router = useRouter();
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
            <Typography variant="h4" component="h1" gutterBottom>
                Auction Management
                {currentTournament && selectedTournament === currentTournament.id && (
                    <Typography component="span" color="primary" sx={{ ml: 1 }}>
                        (Current Tournament)
                    </Typography>
                )}
            </Typography>

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
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <VisibilityIcon sx={{ mr: 2 }} />
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
                            >
                                Open Display
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Auction Control Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <SettingsIcon sx={{ mr: 2 }} />
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