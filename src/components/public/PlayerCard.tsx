'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Button,
  Stack
} from '@mui/material';
import { 
  Person as PersonIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { PlayerProfileModal } from './PlayerProfileModal';
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

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
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
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {player.name}
          </Typography>
          
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Position:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {positionDisplay}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Skill Level:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {skillLevelDisplay}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Points:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatPointsInCrores(player.base_price)}
              </Typography>
            </Box>
          </Stack>
          
          <Box sx={{ mt: 'auto' }}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleOpenModal}
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