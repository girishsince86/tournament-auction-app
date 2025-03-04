'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { fetchWithAuth } from '@/lib/utils/api-client';

export default function CreateUnallocatedPage() {
    const [tournamentId, setTournamentId] = useState('11111111-1111-1111-1111-111111111111');
    const [categoryId, setCategoryId] = useState('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    const [playerName, setPlayerName] = useState('');
    const [skillLevel, setSkillLevel] = useState('RECREATIONAL_C');
    const [position, setPosition] = useState('P1_RIGHT_BACK');
    const [basePrice, setBasePrice] = useState(10000000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleCreatePlayer = async () => {
        if (!playerName) {
            setError('Player name is required');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            // This is a direct database operation - you would need to create this API endpoint
            const response = await fetchWithAuth('/api/debug/create-player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournamentId,
                    categoryId,
                    name: playerName,
                    skillLevel,
                    playerPosition: position,
                    basePrice,
                    status: 'UNALLOCATED'
                }),
            });
            
            setSuccess(`Player "${playerName}" created successfully with status UNALLOCATED`);
            setPlayerName('');
        } catch (err) {
            console.error('Error creating player:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>
                Create UNALLOCATED Player for Testing
            </Typography>
            
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Tournament ID"
                            value={tournamentId}
                            onChange={(e) => setTournamentId(e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                            margin="normal"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            label="Category ID"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                            margin="normal"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            label="Player Name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                            margin="normal"
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" size="small">
                            <InputLabel>Skill Level</InputLabel>
                            <Select
                                value={skillLevel}
                                label="Skill Level"
                                onChange={(e) => setSkillLevel(e.target.value)}
                            >
                                <MenuItem value="RECREATIONAL_C">RECREATIONAL_C</MenuItem>
                                <MenuItem value="INTERMEDIATE_B">INTERMEDIATE_B</MenuItem>
                                <MenuItem value="ADVANCED_A">ADVANCED_A</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" size="small">
                            <InputLabel>Position</InputLabel>
                            <Select
                                value={position}
                                label="Position"
                                onChange={(e) => setPosition(e.target.value)}
                            >
                                <MenuItem value="P1_RIGHT_BACK">P1 - Right Back</MenuItem>
                                <MenuItem value="P2_RIGHT_FRONT">P2 - Right Front</MenuItem>
                                <MenuItem value="P3_MIDDLE_FRONT">P3 - Middle Front</MenuItem>
                                <MenuItem value="P4_LEFT_FRONT">P4 - Left Front</MenuItem>
                                <MenuItem value="P5_LEFT_BACK">P5 - Left Back</MenuItem>
                                <MenuItem value="P6_MIDDLE_BACK">P6 - Middle Back</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <TextField
                            label="Base Price"
                            value={basePrice}
                            onChange={(e) => setBasePrice(Number(e.target.value))}
                            fullWidth
                            variant="outlined"
                            size="small"
                            margin="normal"
                            type="number"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            onClick={handleCreatePlayer}
                            disabled={loading}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Create UNALLOCATED Player'}
                        </Button>
                    </Grid>
                </Grid>
                
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {success}
                    </Alert>
                )}
                
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        Note: This page requires the API endpoint <code>/api/debug/create-player</code> to be implemented.
                        You can use the data shown here to manually create players in your database.
                    </Typography>
                </Alert>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Testing Instructions
                </Typography>
                <Typography variant="body2" paragraph>
                    1. After creating an UNALLOCATED player, go to the auction control page.
                </Typography>
                <Typography variant="body2" paragraph>
                    2. Click "Add Players" and check if the UNALLOCATED player appears in the list.
                </Typography>
                <Typography variant="body2" paragraph>
                    3. If the player doesn't appear, check the browser console for any errors.
                </Typography>
                <Typography variant="body2">
                    4. You can also visit the <a href="/debug/direct-check" style={{ color: 'blue' }}>Direct Check</a> page to verify the player exists in the database.
                </Typography>
            </Paper>
        </Box>
    );
} 