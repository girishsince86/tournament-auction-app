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
  useTheme
} from '@mui/material';
import { 
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { PlayerCardProps } from './PlayerCard';

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
          <Typography variant="h5" component="div">
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
        <Grid container spacing={3}>
          {/* Left column - Image and category */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 300,
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
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
              
              {player.category && (
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Player Category
                  </Typography>
                  <Chip
                    label={player.category.name}
                    color={
                      player.category.category_type === 'LEVEL_1' ? 'primary' : 
                      player.category.category_type === 'LEVEL_2' ? 'secondary' : 
                      'default'
                    }
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      py: 2,
                      width: '100%'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Right column - Player details */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Player name and basic info */}
              <Box>
                <Typography variant="h4" component="h2" gutterBottom>
                  {player.name}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mb: 2 
                }}>
                  <Chip 
                    label={positionDisplay} 
                    variant="outlined" 
                  />
                  {player.skill_level && (
                    <Chip 
                      label={skillLevelDisplay} 
                      variant="outlined" 
                    />
                  )}
                  <Chip 
                    label={`${player.base_price} points`} 
                    variant="outlined" 
                  />
                </Box>
              </Box>
              
              <Divider />
              
              {/* Player details section */}
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: 'primary.main'
                  }}
                >
                  Player Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Position
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {positionDisplay}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Skill Level
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {skillLevelDisplay}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Points
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {player.base_price}
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
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider />
              
              {/* Category details section */}
              {player.category && (
                <>
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        color: 'primary.main'
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
                            {player.category.base_points} points
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Divider />
                </>
              )}
              
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
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
} 