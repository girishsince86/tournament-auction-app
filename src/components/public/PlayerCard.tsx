'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Chip, 
  Button,
  Stack,
  useTheme
} from '@mui/material';
import { 
  Person as PersonIcon,
  SportsVolleyball as SportsVolleyballIcon,
  Star as StarIcon,
  Leaderboard as LeaderboardIcon,
  Height as HeightIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { PlayerProfileModal } from './PlayerProfileModal';
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

// Define last played options
const LAST_PLAYED_OPTIONS = [
  { value: 'PLAYING_ACTIVELY', label: 'Playing Actively' },
  { value: 'NOT_PLAYED_SINCE_LAST_YEAR', label: 'Not Played since last year' },
  { value: 'NOT_PLAYED_IN_FEW_YEARS', label: 'Not played in few years' }
];

export interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    player_position: string;
    skill_level?: string;
    base_price: number;
    status: string;
    profile_image_url?: string | null;
    category_id?: string | null;
    height?: number | null;
    registration_data?: any;
    category?: {
      id: string;
      category_type: string;
      name: string;
      base_points: number;
    } | null;
  };
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Get the display values for position and skill level
  const positionDisplay = POSITION_MAP[player.player_position as keyof typeof POSITION_MAP] || player.player_position;
  const skillLevelDisplay = player.skill_level 
    ? (SKILL_LEVEL_MAP[player.skill_level as keyof typeof SKILL_LEVEL_MAP] || player.skill_level)
    : 'Not specified';

  // Get the last played status
  const getLastPlayedStatus = () => {
    // Default to "Playing Actively" if no registration data is available
    if (!player.registration_data) {
      return LAST_PLAYED_OPTIONS.find(opt => 
        opt.value === 'PLAYING_ACTIVELY'
      )?.label || 'Playing Actively';
    }
    
    // Try multiple approaches to get the last played date
    const regData = player.registration_data;
    
    // Try direct access to known field names
    const lastPlayedValue = 
      regData.last_played_date || 
      regData.last_played ||
      regData.lastPlayed ||
      regData.playing_status;
        
    // If we found a value, look up its label
    if (lastPlayedValue) {
      const option = LAST_PLAYED_OPTIONS.find(opt => 
        opt.value === lastPlayedValue
      );
      if (option) return option.label;
      
      // If the value doesn't match our options but is a string, return it directly
      if (typeof lastPlayedValue === 'string') return lastPlayedValue;
    }
    
    // Default to "Playing Actively" if no value is found
    return LAST_PLAYED_OPTIONS.find(opt => 
      opt.value === 'PLAYING_ACTIVELY'
    )?.label || 'Playing Actively';
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box 
          sx={{ 
            position: 'relative', 
            width: '100%', 
            height: 200,
            backgroundColor: 'grey.100',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
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
            <PersonIcon sx={{ fontSize: 80, color: 'grey.400' }} />
          )}
          
          {player.category && (
            <Chip
              label={player.category.name}
              color={
                player.category.category_type === 'LEVEL_1' ? 'primary' : 
                player.category.category_type === 'LEVEL_2' ? 'secondary' : 
                'default'
              }
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8,
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Typography 
            variant="h6" 
            component="div" 
            gutterBottom 
            noWrap
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              mb: 2
            }}
          >
            {player.name}
          </Typography>
          
          <Chip 
            label={`${formatPointsInCrores(player.base_price)}`}
            icon={<LeaderboardIcon />}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
              alignSelf: 'center',
              mb: 2
            }}
          />
          
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Height
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <HeightIcon fontSize="small" color="action" />
                {player.height ? `${player.height} m` : 'N/A'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            </Box>
          </Stack>
          
          <Box sx={{ mt: 'auto' }}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={handleOpenModal}
              sx={{
                borderRadius: 2,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 2
              }}
            >
              View Profile
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <PlayerProfileModal 
        player={player} 
        open={openModal} 
        onClose={handleCloseModal} 
      />
    </>
  );
}; 