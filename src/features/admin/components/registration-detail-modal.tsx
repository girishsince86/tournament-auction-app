'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  SportsVolleyball as SportsIcon,
  Payment as PaymentIcon,
  Style as JerseyIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { TournamentRegistration } from '@/features/tournaments/types/registration';

interface RegistrationDetailModalProps {
  open: boolean;
  onClose: () => void;
  registration: TournamentRegistration;
}

const categoryMap = {
  'VOLLEYBALL_OPEN_MEN': 'Volleyball - Open',
  'THROWBALL_WOMEN': 'Throwball - Women',
  'THROWBALL_13_17_MIXED': 'Throwball - 13-17 Mixed',
  'THROWBALL_8_12_MIXED': 'Throwball - 8-12 Mixed',
};

export function RegistrationDetailModal({
  open,
  onClose,
  registration,
}: RegistrationDetailModalProps) {
  const theme = useTheme();

  const DetailSection = ({ 
    icon, 
    title, 
    children 
  }: { 
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 1.5, 
        mb: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          transition: 'border-color 0.3s ease',
        }
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </Box>
          <Typography variant="subtitle1" color="primary" fontWeight="500">
            {title}
          </Typography>
        </Box>
        <Divider sx={{ my: '2px !important' }} />
        {children}
      </Stack>
    </Paper>
  );

  const DetailField = ({ 
    label, 
    value,
    fullWidth = false 
  }: { 
    label: string;
    value: React.ReactNode;
    fullWidth?: boolean;
  }) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6}>
      <Box sx={{ py: 0.5 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 0.25 }}
        >
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || '-'}
        </Typography>
      </Box>
    </Grid>
  );

  const StatusChip = ({ 
    verified, 
    size = 'medium' 
  }: { 
    verified: boolean;
    size?: 'small' | 'medium';
  }) => (
    <Chip
      label={verified ? 'Verified' : 'Pending'}
      color={verified ? 'success' : 'warning'}
      size={size}
      sx={{ 
        fontWeight: 500,
        '& .MuiChip-label': {
          px: 2,
        },
      }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '85vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        p: 2,
        pb: 1.5,
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6">
              Registration Details
            </Typography>
            <StatusChip verified={registration.is_verified} size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            REG-{registration.id.slice(0, 8).toUpperCase()}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {/* Personal Information */}
          <DetailSection icon={<PersonIcon />} title="Personal Information">
            <Grid container spacing={1.5}>
              <DetailField label="First Name" value={registration.first_name} />
              <DetailField label="Last Name" value={registration.last_name} />
              <DetailField label="Email" value={registration.email} />
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phone Number
                </Typography>
                <Typography variant="body1">{registration.phone_number}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {registration.date_of_birth ? (
                    <>
                      {new Date(registration.date_of_birth).toLocaleDateString()}
                      {(() => {
                        const dob = new Date(registration.date_of_birth);
                        const cutoffDate = new Date('2025-04-30');
                        const age = cutoffDate.getFullYear() - dob.getFullYear();
                        const monthDiff = cutoffDate.getMonth() - dob.getMonth();
                        const finalAge = monthDiff < 0 || (monthDiff === 0 && cutoffDate.getDate() < dob.getDate()) 
                          ? age - 1 
                          : age;
                        return (
                          <Typography 
                            component="span" 
                            sx={{ 
                              ml: 1,
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                            }}
                          >
                            (Age as of Apr 30, 2025: {finalAge} years)
                          </Typography>
                        );
                      })()}
                    </>
                  ) : (
                    '-'
                  )}
                </Typography>
              </Grid>
            </Grid>
          </DetailSection>

          {/* Registration Details */}
          <DetailSection icon={<SportsIcon />} title="Registration Details">
            <Grid container spacing={1.5}>
              <DetailField 
                label="Category" 
                value={categoryMap[registration.registration_category as keyof typeof categoryMap]} 
              />
              <DetailField 
                label="Registration Date" 
                value={new Date(registration.created_at).toLocaleString()} 
              />
            </Grid>
          </DetailSection>

          {/* Jersey Details */}
          <DetailSection icon={<JerseyIcon />} title="Jersey Details">
            <Grid container spacing={1.5}>
              <DetailField label="Jersey Size" value={registration.tshirt_size} />
              <DetailField label="Jersey Number" value={registration.tshirt_number} />
            </Grid>
          </DetailSection>

          {/* Payment Information */}
          <DetailSection icon={<PaymentIcon />} title="Payment Information">
            <Grid container spacing={1.5}>
              <DetailField 
                label="Amount" 
                value={registration.amount_received ? 
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(registration.amount_received) : 
                  'Not recorded'
                } 
              />
              <DetailField 
                label="Paid To" 
                value={registration.paid_to || 'Not specified'} 
              />
              <DetailField 
                label="UPI ID" 
                value={registration.payment_upi_id || 'Not provided'} 
              />
              <DetailField 
                label="Transaction ID" 
                value={registration.payment_transaction_id || 'Not provided'} 
              />
              <DetailField 
                label="Verified By" 
                value={registration.verified_by || 'Not verified'} 
              />
              <DetailField 
                label="Verification Date" 
                value={registration.verified_at ? 
                  new Date(registration.verified_at).toLocaleString() : 
                  'Not verified'
                } 
              />
              {registration.verification_notes && (
                <DetailField 
                  label="Payment Notes" 
                  value={registration.verification_notes}
                  fullWidth 
                />
              )}
            </Grid>
          </DetailSection>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 1.5 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          size="small"
          sx={{ px: 3 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 