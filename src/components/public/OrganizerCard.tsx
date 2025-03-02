'use client';

import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  Chip, 
  Stack,
  Divider,
  CardActions,
  Button,
  useTheme,
  alpha,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import { OrganizerProfile } from '@/types/organizer';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import Link from 'next/link';
import { useState } from 'react';

export interface OrganizerCardProps {
  profile: OrganizerProfile;
  variant?: 'compact' | 'full';
}

export function OrganizerCard({ profile, variant = 'compact' }: OrganizerCardProps) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      elevation={isHovered ? 8 : 3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        minHeight: variant === 'full' ? 'auto' : '600px',
        maxHeight: variant === 'full' ? 'none' : '800px',
        position: 'relative',
        transform: isHovered ? 'translateY(-12px)' : 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: isHovered 
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
          zIndex: 10,
          transition: 'all 0.3s ease',
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box 
        className="card-header"
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.8),
          transition: 'all 0.4s ease',
          backgroundImage: isHovered
            ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.primary.main, 0.85)})`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pt: 2,
          pb: 12,
          px: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
          {profile.role && (
            <Chip
              label={profile.role}
              size="small"
              sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.9),
                color: theme.palette.primary.main,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                borderRadius: '16px',
                px: 1
              }}
            />
          )}
        </Box>
        
        <Paper
          elevation={isHovered ? 12 : 5}
          sx={{
            borderRadius: '50%',
            padding: '4px',
            backgroundColor: 'white',
            position: 'absolute',
            bottom: -70,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            transition: 'all 0.4s ease',
            boxShadow: isHovered 
              ? `0 15px 30px ${alpha(theme.palette.primary.main, 0.3)}`
              : `0 8px 20px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          <Avatar
            className="profile-avatar"
            src={profile.profile_image_url}
            alt={`${profile.first_name} ${profile.last_name}`}
            sx={{ 
              width: variant === 'full' ? 160 : 140, 
              height: variant === 'full' ? 160 : 140,
              transition: 'all 0.4s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {!profile.profile_image_url && <PersonIcon sx={{ fontSize: variant === 'full' ? 80 : 70 }} />}
          </Avatar>
        </Paper>
      </Box>
      
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        p: 3,
        pt: 10,
        mt: 0,
        overflowY: 'auto',
        backgroundColor: isHovered ? alpha(theme.palette.background.paper, 0.9) : theme.palette.background.paper,
        transition: 'all 0.3s ease',
      }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant={variant === 'full' ? 'h4' : 'h5'} 
            component="h2" 
            gutterBottom={false}
            sx={{ 
              fontWeight: 700,
              textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
              background: isHovered 
                ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                : 'none',
              backgroundClip: isHovered ? 'text' : 'none',
              WebkitBackgroundClip: isHovered ? 'text' : 'none',
              color: isHovered ? 'transparent' : 'inherit',
              transition: 'all 0.4s ease',
            }}
          >
            {profile.first_name} {profile.last_name}
          </Typography>
          {profile.profession && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: '1rem',
                mt: 0.5
              }}
            >
              {profile.profession}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ 
          width: '60px', 
          mx: 'auto', 
          borderColor: isHovered ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3),
          transition: 'all 0.3s ease',
        }} />
        
        {/* Sports Background Section */}
        {profile.sports_background && (
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: isHovered ? alpha(theme.palette.primary.light, 0.08) : 'transparent',
            transition: 'all 0.3s ease',
          }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                color: theme.palette.primary.main
              }}
            >
              <EmojiEventsIcon fontSize="small" /> Sports Background
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: '0.95rem', mt: 1 }}>
              {profile.sports_background}
            </Typography>
          </Box>
        )}
        
        {/* Philosophy Section */}
        {profile.philosophy && (
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: isHovered ? alpha(theme.palette.secondary.light, 0.08) : 'transparent',
            transition: 'all 0.3s ease',
          }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                color: theme.palette.secondary.main
              }}
            >
              <PsychologyIcon fontSize="small" /> Philosophy
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: '0.95rem', mt: 1, fontStyle: 'italic' }}>
              "{profile.philosophy}"
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 