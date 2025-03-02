'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  Stack,
  Divider,
  useTheme,
  Paper,
  Avatar
} from '@mui/material';
import { 
  Close as CloseIcon,
  Person as PersonIcon,
  SportsVolleyball as SportsVolleyballIcon,
  Star as StarIcon,
  Height as HeightIcon,
  Leaderboard as LeaderboardIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { PlayerCardProps } from './PlayerCard';
import { POSITIONS, SKILL_LEVELS } from '@/lib/constants';
import { formatPointsInCrores } from '@/lib/utils/format';

// Define the skill level display mapping
const SKILL_LEVEL_MAP = {
  'RECREATIONAL_C': 'Recreational (C)',
  'INTERMEDIATE_B': 'Intermediate (B)',
  'UPPER_INTERMEDIATE_BB': 'Upper Intermediate (BB)',
  'COMPETITIVE_A': 'Competitive (A)',
};

// Define position display mapping
const POSITION_MAP = {
  'P1_RIGHT_BACK': 'Right Back',
  'P2_RIGHT_FRONT': 'Right Front',
  'P3_MIDDLE_FRONT': 'Middle Front',
  'P4_LEFT_FRONT': 'Left Front',
  'P5_LEFT_BACK': 'Left Back',
  'P6_MIDDLE_BACK': 'Middle Back',
};

interface PlayerProfileModalProps {
  player: PlayerCardProps['player'];
  open: boolean;
  onClose: () => void;
}

export function PlayerProfileModal({ player, open, onClose }: PlayerProfileModalProps) {
  const theme = useTheme();
  
  // Get the display values for position and skill level
  const positionDisplay = POSITION_MAP[player.player_position as keyof typeof POSITION_MAP] || player.player_position;
  const skillLevelDisplay = player.skill_level 
    ? (SKILL_LEVEL_MAP[player.skill_level as keyof typeof SKILL_LEVEL_MAP] || player.skill_level)
    : 'Not specified';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
      aria-labelledby="player-profile-title"
    >
      <DialogTitle id="player-profile-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            Player Profile
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose} 
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mb: 4,
            p: 3,
            bgcolor: 'background.default',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
            }
          }}
        >
          {/* Left side - Image and Basic Info */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: { md: '220px' }
            }}
          >
            <Box 
              sx={{ 
                position: 'relative', 
                width: 200,
                height: 200,
                backgroundColor: 'grey.100',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '4px solid',
                borderColor: 'primary.main',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              {player.profile_image_url ? (
                <Image
                  src={player.profile_image_url}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <PersonIcon sx={{ fontSize: 100, color: 'grey.400' }} />
              )}
            </Box>
            
            <Stack spacing={1} alignItems="center">
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  textAlign: 'center'
                }}
              >
                {player.name}
              </Typography>
              <Chip 
                label={`Base Points: ${formatPointsInCrores(player.base_price)}`}
                icon={<LeaderboardIcon />}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                  px: 1
                }}
              />
              {player.category && (
                <Chip
                  label={player.category.name}
                  color={
                    player.category.category_type === 'LEVEL_1' ? 'primary' : 
                    player.category.category_type === 'LEVEL_2' ? 'secondary' : 
                    'default'
                  }
                  sx={{ 
                    fontWeight: 'bold',
                    mt: 1
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Right side - Detailed Info */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography 
                variant="subtitle1" 
                color="primary"
                sx={{ 
                  mb: 1.5, 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  pb: 1
                }}
              >
                <PersonIcon fontSize="small" />
                Player Attributes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Position
                    </Typography>
                    <Chip 
                      label={positionDisplay}
                      icon={<SportsVolleyballIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        fontWeight: 'medium',
                        width: 'fit-content'
                      }}
                    />
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Skill Level
                    </Typography>
                    <Chip 
                      label={skillLevelDisplay}
                      icon={<StarIcon />}
                      size="small"
                      sx={{ 
                        bgcolor: theme.palette.secondary.light,
                        color: theme.palette.secondary.contrastText,
                        fontWeight: 'medium',
                        width: 'fit-content'
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Height
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <HeightIcon fontSize="small" color="action" />
                      {player.height ? `${player.height} m` : 'N/A'}
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={player.status} 
                      color={
                        player.status === 'AVAILABLE' ? 'success' :
                        player.status === 'SOLD' ? 'primary' :
                        player.status === 'UNSOLD' ? 'warning' :
                        'default'
                      }
                      size="small"
                      sx={{ width: 'fit-content' }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {player.category && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  mt: 2
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  color="primary"
                  sx={{ 
                    mb: 1.5, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    pb: 1
                  }}
                >
                  Category Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Category Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {player.category.name}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Category Type
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {player.category.category_type}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Base Points
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPointsInCrores(player.category.base_points)} points
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        </Box>
        
        {/* Note about player information */}
        <Box sx={{ 
          backgroundColor: 'grey.50', 
          p: 2, 
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="body2" color="text.secondary">
            This player information is displayed for community reference. For more details or to contact the player, please reach out to the tournament organizers.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 