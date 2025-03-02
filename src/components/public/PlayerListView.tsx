'use client';

import { useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Button,
  Chip,
  Avatar,
  Box,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon,
  Height as HeightIcon
} from '@mui/icons-material';
import { PlayerProfileModal } from './PlayerProfileModal';
import type { PlayerCardProps } from './PlayerCard';
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

interface PlayerListViewProps {
  players: PlayerCardProps['player'][];
}

export function PlayerListView({ players }: PlayerListViewProps) {
  const [openModalPlayerId, setOpenModalPlayerId] = useState<string | null>(null);

  const handleOpenModal = (playerId: string) => {
    setOpenModalPlayerId(playerId);
  };

  const handleCloseModal = () => {
    setOpenModalPlayerId(null);
  };

  const getPlayerById = (id: string) => {
    return players.find(player => player.id === id) || null;
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table sx={{ minWidth: 650 }} aria-label="players table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell>Player</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Skill Level</TableCell>
              <TableCell>Height</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => {
              // Get the display values for position and skill level
              const positionDisplay = POSITION_MAP[player.player_position as keyof typeof POSITION_MAP] || player.player_position;
              const skillLevelDisplay = player.skill_level 
                ? (SKILL_LEVEL_MAP[player.skill_level as keyof typeof SKILL_LEVEL_MAP] || player.skill_level)
                : 'Not specified';

              return (
                <TableRow
                  key={player.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {player.profile_image_url ? (
                          <img 
                            src={player.profile_image_url} 
                            alt={player.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">
                        {player.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {player.category ? (
                      <Chip
                        label={player.category.name}
                        size="small"
                        color={
                          player.category.category_type === 'LEVEL_1' ? 'primary' : 
                          player.category.category_type === 'LEVEL_2' ? 'secondary' : 
                          'default'
                        }
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Category
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{positionDisplay}</TableCell>
                  <TableCell>{skillLevelDisplay}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <HeightIcon fontSize="small" color="action" />
                      {player.height ? `${player.height} m` : 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatPointsInCrores(player.base_price)}</TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenModal(player.id)}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {openModalPlayerId && (
        <PlayerProfileModal 
          player={getPlayerById(openModalPlayerId)!} 
          open={!!openModalPlayerId} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
} 