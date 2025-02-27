'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Checkbox, 
  CircularProgress, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Tournament {
  id: string;
  name: string;
}

interface RegistrationStatistic {
  category: string;
  total_registrations: number;
  verified_registrations: number;
  players_created: number;
  verification_percentage: number;
}

interface LoadPlayersResponse {
  players_added: number;
  players_updated: number;
  players_skipped: number;
}

export function PlayerRegistrationManager() {
  const supabase = createClientComponentClient();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [updateExisting, setUpdateExisting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<RegistrationStatistic[]>([]);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LoadPlayersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteCategory, setDeleteCategory] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteResult, setDeleteResult] = useState<number | null>(null);

  // Fetch tournaments and statistics on component mount
  useEffect(() => {
    fetchTournaments();
    fetchStatistics();
  }, []);

  // Fetch tournaments from the database
  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tournaments:', error);
        return;
      }

      setTournaments(data || []);
      if (data && data.length > 0) {
        setSelectedTournament(data[0].id);
      }
    } catch (error) {
      console.error('Unexpected error fetching tournaments:', error);
    }
  };

  // Fetch registration statistics
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/players/load-from-registrations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }

      setStatistics(data.statistics || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle loading players from registrations
  const handleLoadPlayers = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/players/load-from-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory || null,
          tournamentId: selectedTournament || null,
          updateExisting,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load players');
      }

      setResult(data.data);
      // Refresh statistics after loading players
      fetchStatistics();
    } catch (error) {
      console.error('Error loading players:', error);
      setError(error instanceof Error ? error.message : 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (category: string | null) => {
    setDeleteCategory(category);
    setOpenDialog(true);
  };

  // Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDialog(false);
  };

  // Handle deleting players from registrations
  const handleDeletePlayers = async () => {
    setDeleteLoading(true);
    setDeleteResult(null);
    setError(null);

    try {
      const url = `/api/admin/players/load-from-registrations${
        deleteCategory ? `?category=${encodeURIComponent(deleteCategory)}` : ''
      }`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete players');
      }

      setDeleteResult(data.playersDeleted);
      // Refresh statistics after deleting players
      fetchStatistics();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting players:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete players');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Player Registration Manager
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {deleteResult !== null && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully deleted {deleteResult} players
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Load Players Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Load Players from Registrations" />
            <Divider />
            <CardContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="tournament-select-label">Tournament</InputLabel>
                <Select
                  labelId="tournament-select-label"
                  value={selectedTournament}
                  label="Tournament"
                  onChange={(e) => setSelectedTournament(e.target.value)}
                >
                  {tournaments.map((tournament) => (
                    <MenuItem key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="category-select-label">Category (Optional)</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedCategory}
                  label="Category (Optional)"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {statistics.map((stat) => (
                    <MenuItem key={stat.category} value={stat.category}>
                      {stat.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                  />
                }
                label="Update existing players"
              />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLoadPlayers}
                  disabled={loading || !selectedTournament}
                >
                  {loading ? <CircularProgress size={24} /> : 'Load Players'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleOpenDeleteDialog(selectedCategory)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? <CircularProgress size={24} /> : 'Clean Up Players'}
                </Button>
              </Box>

              {result && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Results:</Typography>
                  <Typography>Players Added: {result.players_added}</Typography>
                  <Typography>Players Updated: {result.players_updated}</Typography>
                  <Typography>Players Skipped: {result.players_skipped}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Registration Statistics" 
              action={
                <Button 
                  size="small" 
                  onClick={fetchStatistics}
                  disabled={statsLoading}
                >
                  {statsLoading ? <CircularProgress size={20} /> : 'Refresh'}
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {statsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Verified</TableCell>
                        <TableCell align="right">Players Created</TableCell>
                        <TableCell align="right">Verification %</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.map((stat) => (
                        <TableRow key={stat.category}>
                          <TableCell component="th" scope="row">
                            {stat.category}
                          </TableCell>
                          <TableCell align="right">{stat.total_registrations}</TableCell>
                          <TableCell align="right">{stat.verified_registrations}</TableCell>
                          <TableCell align="right">{stat.players_created}</TableCell>
                          <TableCell align="right">{stat.verification_percentage}%</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(stat.category)}
                              disabled={stat.players_created === 0}
                            >
                              Clean
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteCategory 
              ? `Are you sure you want to delete all players created from ${deleteCategory} registrations?` 
              : 'Are you sure you want to delete ALL players created from registrations?'}
            <br /><br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePlayers} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 