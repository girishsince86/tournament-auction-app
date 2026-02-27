'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  SportsVolleyball as SportsVolleyballIcon,
  Star as StarIcon,
  Height as HeightIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { PlayerProfileModal } from './PlayerProfileModal';
import { formatPointsInCrores } from '@/lib/utils/format';

// Define the skill level display mapping
const SKILL_LEVEL_MAP = {
  'RECREATIONAL_C': 'Recreational',
  'RECREATIONAL': 'Recreational',
  'INTERMEDIATE_B': 'Intermediate',
  'COMPETITIVE_C': 'Intermediate',
  'UPPER_INTERMEDIATE_BB': 'Upper Intermediate',
  'COMPETITIVE_B': 'Upper Intermediate',
  'COMPETITIVE_A': 'Competitive',
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

// Category color mapping for the card glow/accent
const getCategoryColors = (categoryType?: string) => {
  switch (categoryType) {
    case 'LEVEL_1': // Marquee
      return { glow: '#eab308', border: '#eab308', badge: '#eab308' };
    case 'LEVEL_2': // Capped
      return { glow: '#0ea5e9', border: '#0ea5e9', badge: '#ef4444' };
    default: // Uncapped
      return { glow: '#6b7280', border: '#374151', badge: '#6b7280' };
  }
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
    if (!player.registration_data) {
      return LAST_PLAYED_OPTIONS.find(opt =>
        opt.value === 'PLAYING_ACTIVELY'
      )?.label || 'Playing Actively';
    }

    const regData = player.registration_data;
    const lastPlayedValue =
      regData.last_played_date ||
      regData.last_played ||
      regData.lastPlayed ||
      regData.playing_status;

    if (lastPlayedValue) {
      const option = LAST_PLAYED_OPTIONS.find(opt =>
        opt.value === lastPlayedValue
      );
      if (option) return option.label;
      if (typeof lastPlayedValue === 'string') return lastPlayedValue;
    }

    return LAST_PLAYED_OPTIONS.find(opt =>
      opt.value === 'PLAYING_ACTIVELY'
    )?.label || 'Playing Actively';
  };

  const categoryColors = getCategoryColors(player.category?.category_type);

  return (
    <>
      <Card
        onClick={handleOpenModal}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 3,
          overflow: 'hidden',
          cursor: 'pointer',
          background: `linear-gradient(145deg, ${alpha('#1a2234', 0.95)}, ${alpha('#111827', 0.98)})`,
          border: `1px solid ${alpha(categoryColors.border, 0.3)}`,
          borderLeft: `3px solid ${categoryColors.border}`,
          boxShadow: `0 4px 20px ${alpha('#000', 0.3)}`,
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: `0 8px 30px ${alpha(categoryColors.glow, 0.25)}, 0 0 20px ${alpha(categoryColors.glow, 0.1)}`,
            border: `1px solid ${alpha(categoryColors.border, 0.6)}`,
            borderLeft: `3px solid ${categoryColors.border}`,
          }
        }}
      >
        {/* Photo Section */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            backgroundColor: '#0a0e17',
            overflow: 'hidden',
          }}
        >
          {player.profile_image_url ? (
            <Image
              src={player.profile_image_url}
              alt={player.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            />
          ) : (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              background: `linear-gradient(135deg, ${alpha('#1a2234', 1)}, ${alpha('#0a0e17', 1)})`,
            }}>
              <PersonIcon sx={{ fontSize: 80, color: alpha('#fff', 0.15) }} />
            </Box>
          )}

          {/* Category badge */}
          {player.category && (
            <Chip
              label={player.category.name}
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                bgcolor: alpha(categoryColors.badge, 0.9),
                color: '#fff',
                border: `1px solid ${alpha('#fff', 0.2)}`,
                backdropFilter: 'blur(4px)',
                height: 24,
              }}
            />
          )}
        </Box>

        {/* Name + Price below photo */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#fff',
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
              }}
            >
              {player.name}
            </Typography>

            <Chip
              label={formatPointsInCrores(player.base_price)}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                bgcolor: alpha('#eab308', 0.15),
                color: '#eab308',
                border: `1px solid ${alpha('#eab308', 0.4)}`,
                height: 26,
                flexShrink: 0,
                '& .MuiChip-label': { px: 1.5 },
              }}
            />
          </Box>
        </Box>

        {/* Stats Section */}
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            pt: 1.5,
            '&:last-child': { pb: 2 },
          }}
        >
          {/* Stats Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              mb: 1.5,
            }}
          >
            {/* Position */}
            <StatBlock
              label="Position"
              value={positionDisplay}
              icon={<SportsVolleyballIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />}
            />

            {/* Skill Level */}
            <StatBlock
              label="Skill"
              value={skillLevelDisplay}
              icon={<StarIcon sx={{ fontSize: 14, color: theme.palette.secondary.main }} />}
            />

            {/* Height */}
            <StatBlock
              label="Height"
              value={player.height ? `${player.height} cm` : 'N/A'}
              icon={<HeightIcon sx={{ fontSize: 14, color: theme.palette.info.main }} />}
            />

            {/* Status */}
            <StatBlock
              label="Status"
              value={player.status === 'AVAILABLE' ? 'Available' : player.status === 'SOLD' ? 'Sold' : player.status}
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor:
                      player.status === 'AVAILABLE' ? theme.palette.success.main :
                      player.status === 'SOLD' ? theme.palette.primary.main :
                      player.status === 'UNSOLD' ? theme.palette.warning.main :
                      theme.palette.grey[500],
                  }}
                />
              }
              valueColor={
                player.status === 'AVAILABLE' ? theme.palette.success.main :
                player.status === 'SOLD' ? theme.palette.primary.main :
                player.status === 'UNSOLD' ? theme.palette.warning.main :
                undefined
              }
            />
          </Box>

          {/* View Profile Button */}
          <Button
            variant="outlined"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal();
            }}
            startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
            sx={{
              mt: 'auto',
              borderRadius: 2,
              py: 0.75,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderColor: alpha(categoryColors.border, 0.4),
              color: alpha('#fff', 0.8),
              '&:hover': {
                borderColor: categoryColors.border,
                bgcolor: alpha(categoryColors.border, 0.1),
                color: '#fff',
              },
            }}
          >
            View Profile
          </Button>
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

// Compact stat block component
const StatBlock = ({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueColor?: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
      p: 1,
      borderRadius: 1.5,
      bgcolor: alpha('#fff', 0.03),
      border: `1px solid ${alpha('#fff', 0.05)}`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Typography
        variant="caption"
        sx={{
          color: alpha('#fff', 0.45),
          fontSize: '0.65rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body2"
      sx={{
        fontWeight: 600,
        fontSize: '0.78rem',
        color: valueColor || alpha('#fff', 0.9),
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Typography>
  </Box>
);
