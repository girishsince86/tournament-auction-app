'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  ListItemText,
  Checkbox,
  OutlinedInput,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { 
  Registration, 
  RegistrationCategory,
  SkillLevel,
  LastPlayedStatus,
  TshirtSize,
  PlayingPosition
} from '../types/registration-admin';

interface RegistrationDetailModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRegistration: Registration) => Promise<void>;
  onDelete: (registrationId: string) => Promise<void>;
}

const PLAYING_POSITIONS = [
  { value: 'P1_RIGHT_BACK', label: 'Right Back (P1)' },
  { value: 'P2_RIGHT_FRONT', label: 'Right Front (P2)' },
  { value: 'P3_MIDDLE_FRONT', label: 'Middle Front (P3)' },
  { value: 'P4_LEFT_FRONT', label: 'Left Front (P4)' },
  { value: 'P5_LEFT_BACK', label: 'Left Back (P5)' },
  { value: 'P6_MIDDLE_BACK', label: 'Middle Back (P6)' },
] as const;

export function RegistrationDetailModal({
  registration,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: RegistrationDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Registration>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (registration) {
      setFormData(registration);
    }
    setIsEditing(false);
    setIsDeleting(false);
    setError(null);
  }, [registration]);

  const handleSave = async () => {
    if (!registration || !formData) return;
    
    try {
      setIsSaving(true);
      setError(null);
      await onSave({ ...registration, ...formData });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!registration) return;
    
    try {
      setIsSaving(true);
      setError(null);
      await onDelete(registration.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete registration');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone_number || ''}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Flat Number"
              value={formData.flat_number || ''}
              onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.registration_category || ''}
                onChange={(e) => setFormData({ ...formData, registration_category: e.target.value as RegistrationCategory })}
                label="Category"
              >
                <MenuItem value="VOLLEYBALL_OPEN_MEN">Volleyball - Open Men</MenuItem>
                <MenuItem value="THROWBALL_WOMEN">Throwball - Women</MenuItem>
                <MenuItem value="THROWBALL_13_17_MIXED">Throwball - 13-17 Mixed</MenuItem>
                <MenuItem value="THROWBALL_8_12_MIXED">Throwball - 8-12 Mixed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Skill Level</InputLabel>
              <Select
                value={formData.skill_level || ''}
                onChange={(e) => setFormData({ ...formData, skill_level: e.target.value as SkillLevel })}
                label="Skill Level"
              >
                <MenuItem value="RECREATIONAL_C">Recreational C</MenuItem>
                <MenuItem value="INTERMEDIATE_B">Intermediate B</MenuItem>
                <MenuItem value="UPPER_INTERMEDIATE_BB">Upper Intermediate BB</MenuItem>
                <MenuItem value="COMPETITIVE_A">Competitive A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Last Played</InputLabel>
              <Select
                value={formData.last_played_date || ''}
                onChange={(e) => setFormData({ ...formData, last_played_date: e.target.value as LastPlayedStatus })}
                label="Last Played"
              >
                <MenuItem value="PLAYING_ACTIVELY">Playing Actively</MenuItem>
                <MenuItem value="NOT_PLAYED_SINCE_LAST_YEAR">Not Played since last year</MenuItem>
                <MenuItem value="NOT_PLAYED_IN_FEW_YEARS">Not played in few years</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>T-shirt Size</InputLabel>
              <Select
                value={formData.tshirt_size || ''}
                onChange={(e) => setFormData({ ...formData, tshirt_size: e.target.value as TshirtSize })}
                label="T-shirt Size"
              >
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((size) => (
                  <MenuItem key={size} value={size}>{size}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Playing Position</InputLabel>
              <Select
                value={formData.playing_positions?.[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    playing_positions: value ? [value] : [],
                  });
                }}
                label="Playing Position"
              >
                {PLAYING_POSITIONS.map((position) => (
                  <MenuItem key={position.value} value={position.value}>
                    {position.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_verified || false}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  color="success"
                />
              }
              label={formData.is_verified ? 'Verified' : 'Pending Verification'}
            />
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">Name</div>
            <div className="mt-1 text-sm text-gray-900">
              {registration?.first_name} {registration?.last_name}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">Phone Number</div>
            <div className="mt-1 text-sm text-gray-900">{registration?.phone_number}</div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">Flat Number</div>
            <div className="mt-1 text-sm text-gray-900">{registration?.flat_number}</div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">Category</div>
            <div className="mt-1 text-sm text-gray-900">
              {registration?.registration_category === 'VOLLEYBALL_OPEN_MEN' && 'Volleyball - Open Men'}
              {registration?.registration_category === 'THROWBALL_WOMEN' && 'Throwball - Women'}
              {registration?.registration_category === 'THROWBALL_13_17_MIXED' && 'Throwball - 13-17 Mixed'}
              {registration?.registration_category === 'THROWBALL_8_12_MIXED' && 'Throwball - 8-12 Mixed'}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">Skill Level</div>
            <div className="mt-1 text-sm text-gray-900">
              {registration?.skill_level === 'RECREATIONAL_C' && 'Recreational C'}
              {registration?.skill_level === 'INTERMEDIATE_B' && 'Intermediate B'}
              {registration?.skill_level === 'UPPER_INTERMEDIATE_BB' && 'Upper Intermediate BB'}
              {registration?.skill_level === 'COMPETITIVE_A' && 'Competitive A'}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">Last Played</div>
            <div className="mt-1 text-sm text-gray-900">
              {registration?.last_played_date === 'PLAYING_ACTIVELY' && 'Playing Actively'}
              {registration?.last_played_date === 'NOT_PLAYED_SINCE_LAST_YEAR' && 'Not Played since last year'}
              {registration?.last_played_date === 'NOT_PLAYED_IN_FEW_YEARS' && 'Not played in few years'}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div>
            <div className="text-sm font-medium text-gray-500">T-shirt Size</div>
            <div className="mt-1 text-sm text-gray-900">{registration?.tshirt_size}</div>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div>
            <div className="text-sm font-medium text-gray-500">Playing Positions</div>
            <div className="mt-1 text-sm text-gray-900">
              {registration?.playing_positions?.map((position) => (
                <Chip
                  key={position}
                  label={
                    position === 'P1_RIGHT_BACK' ? 'Right Back (P1)' :
                    position === 'P2_RIGHT_FRONT' ? 'Right Front (P2)' :
                    position === 'P3_MIDDLE_FRONT' ? 'Middle Front (P3)' :
                    position === 'P4_LEFT_FRONT' ? 'Left Front (P4)' :
                    position === 'P5_LEFT_BACK' ? 'Left Back (P5)' :
                    position === 'P6_MIDDLE_BACK' ? 'Middle Back (P6)' :
                    position
                  }
                  size="small"
                  style={{ marginRight: 4, marginBottom: 4 }}
                />
              ))}
            </div>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div>
            <div className="text-sm font-medium text-gray-500">Status</div>
            <div className="mt-1">
              <Chip
                label={registration?.is_verified ? 'Verified' : 'Pending'}
                color={registration?.is_verified ? 'success' : 'warning'}
                size="small"
              />
            </div>
          </div>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Registration Details
        </DialogTitle>

        <DialogContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {renderContent()}
        </DialogContent>

        <DialogActions>
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onClose}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsDeleting(true)}
                color="error"
              >
                Delete
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                variant="contained"
              >
                Edit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Registration
        </DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this registration? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleting(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 