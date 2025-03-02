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
  ListItemText
} from '@mui/material';
import { TeamOwnerProfile } from '@/types/team-owner';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Link from 'next/link';

export interface TeamOwnerCardProps {
  profile: TeamOwnerProfile;
  showTeamName?: boolean;
  variant?: 'compact' | 'full';
}

export function TeamOwnerCard({ profile, showTeamName = true, variant = 'compact' }: TeamOwnerCardProps) {
  const theme = useTheme();
  
  // Debug log to check profile data
  console.log(`Rendering profile for: ${profile.first_name} ${profile.last_name}`, profile);
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        minHeight: variant === 'full' ? 'auto' : '600px',
        maxHeight: variant === 'full' ? 'none' : '800px',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[10],
          '& .card-header': {
            backgroundColor: alpha(theme.palette.primary.main, 0.9),
          },
          '& .profile-avatar': {
            transform: 'scale(1.05)',
            boxShadow: theme.shadows[8],
          }
        }
      }}
    >
      <Box 
        className="card-header"
        sx={{ 
          backgroundColor: alpha(theme.palette.primary.main, 0.8),
          transition: 'background-color 0.3s ease',
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.primary.main, 0.85)})`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pt: 2,
          pb: 12,
          px: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
          {showTeamName && profile.team_name && (
            <Chip
              label={profile.team_name}
              size="small"
              sx={{ 
                backgroundColor: alpha(theme.palette.common.white, 0.9),
                color: theme.palette.primary.main,
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          )}
        </Box>
        
        <Avatar
          className="profile-avatar"
          src={profile.profile_image_url}
          alt={`${profile.first_name} ${profile.last_name}`}
          sx={{ 
            width: variant === 'full' ? 160 : 140, 
            height: variant === 'full' ? 160 : 140,
            border: `4px solid ${theme.palette.common.white}`,
            boxShadow: theme.shadows[5],
            backgroundColor: theme.palette.grey[200],
            transition: 'all 0.3s ease',
            position: 'absolute',
            bottom: -70,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2
          }}
        >
          {!profile.profile_image_url && <PersonIcon sx={{ fontSize: variant === 'full' ? 80 : 70 }} />}
        </Avatar>
      </Box>
      
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1.5,
        p: 3,
        pt: 10,
        mt: 0,
        overflowY: 'auto'
      }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant={variant === 'full' ? 'h4' : 'h5'} 
            component="h2" 
            gutterBottom={false}
            sx={{ 
              fontWeight: 600,
              textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {profile.first_name} {profile.last_name}
          </Typography>
          {profile.team_role && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}
            >
              {profile.team_role}
            </Typography>
          )}
        </Box>
        
        {/* Profession Section */}
        {profile.profession && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <WorkIcon fontSize="small" /> Profession
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
              {profile.profession}
            </Typography>
          </Box>
        )}
        
        {/* Sports Interests Section */}
        {profile.sports_interests && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <SportsSoccerIcon fontSize="small" /> Sports Interests
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
              {profile.sports_interests}
            </Typography>
          </Box>
        )}
        
        {/* Sports Background Section */}
        {profile.sports_background && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <EmojiEventsIcon fontSize="small" /> Sports Background
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
              {profile.sports_background}
            </Typography>
          </Box>
        )}
        
        {/* Family Impact Section */}
        {profile.family_impact && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <FamilyRestroomIcon fontSize="small" /> Family Impact
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
              {profile.family_impact}
            </Typography>
          </Box>
        )}
        
        {/* Philosophy Section */}
        {profile.philosophy && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <PsychologyIcon fontSize="small" /> Philosophy
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
              {profile.philosophy}
            </Typography>
          </Box>
        )}
        
        {/* Notable Achievements Section */}
        {profile.notable_achievements && profile.notable_achievements.length > 0 && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <EmojiEventsIcon fontSize="small" /> Notable Achievements
            </Typography>
            <List dense sx={{ pl: 1, pt: 0 }}>
              {profile.notable_achievements.map((achievement, index) => (
                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <EmojiEventsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={achievement} 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      sx: { lineHeight: 1.4, fontSize: '0.95rem' } 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* Bio Section - Only in full view */}
        {variant === 'full' && profile.bio && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <PersonIcon fontSize="small" /> Bio
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
              {profile.bio}
            </Typography>
          </Box>
        )}
        
        {/* Contact Email Section */}
        {profile.contact_email && (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1
              }}
            >
              <EmailIcon fontSize="small" /> Contact
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                icon={<EmailIcon fontSize="small" />} 
                label={profile.contact_email} 
                size="small" 
                variant="outlined"
                sx={{ 
                  maxWidth: '100%', 
                  overflow: 'hidden',
                  borderRadius: '4px',
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main
                  }
                }}
              />
            </Stack>
          </Box>
        )}
      </CardContent>
      
      {variant === 'compact' && (
        <CardActions sx={{ 
          p: 2, 
          pt: 0,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          justifyContent: 'center'
        }}>
          <Button 
            size="small" 
            component={Link} 
            href={`/team-owners/${profile.id}`}
            variant="contained"
            color="primary"
            sx={{ 
              borderRadius: '20px',
              px: 3,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            View Full Profile
          </Button>
        </CardActions>
      )}
    </Card>
  );
} 