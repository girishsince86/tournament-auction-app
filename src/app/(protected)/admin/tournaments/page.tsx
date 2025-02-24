'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import toast from 'react-hot-toast';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];

export default function TournamentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState<TournamentInsert>({
    name: '',
    description: '',
    team_budget: 5000000,
    registration_deadline: new Date().toISOString(),
  });

  const supabase = createClientComponentClient<Database>();
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TournamentInsert) => {
      const { error } = await supabase
        .from('tournaments')
        .upsert([data])
        .select()
        .single();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      handleCloseDialog();
      toast.success(
        selectedTournament
          ? 'Tournament updated successfully'
          : 'Tournament created successfully'
      );
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleOpenDialog = (tournament?: Tournament) => {
    if (tournament) {
      setSelectedTournament(tournament);
      setFormData({
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        team_budget: tournament.team_budget,
        registration_deadline: tournament.registration_deadline,
      });
    } else {
      setSelectedTournament(null);
      setFormData({
        name: '',
        description: '',
        team_budget: 5000000,
        registration_deadline: new Date().toISOString(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTournament(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tournament Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Tournament
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tournaments.map((tournament) => (
          <Grid item xs={12} key={tournament.id}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">{tournament.name}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {tournament.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Team Budget: {tournament.team_budget.toLocaleString()} points
                  </Typography>
                  <Typography variant="body2">
                    Registration Deadline:{' '}
                    {new Date(tournament.registration_deadline).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(tournament)}
                  sx={{ mt: -1, mr: -1 }}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedTournament ? 'Edit Tournament' : 'Create Tournament'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Tournament Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                label="Team Budget (points)"
                type="number"
                fullWidth
                required
                value={formData.team_budget}
                onChange={(e) =>
                  setFormData({ ...formData, team_budget: parseInt(e.target.value) })
                }
              />
              <TextField
                label="Registration Deadline"
                type="date"
                fullWidth
                required
                value={formData.registration_deadline.split('T')[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration_deadline: new Date(e.target.value).toISOString(),
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedTournament ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

