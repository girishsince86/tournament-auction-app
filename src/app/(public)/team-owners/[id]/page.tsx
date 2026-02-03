'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Skeleton,
  Alert,
  Button,
  Breadcrumbs,
  Paper,
  useTheme,
  alpha,
  Fade,
  Divider,
  Chip
} from '@mui/material';
import { TeamOwnerCard } from '@/components/public/TeamOwnerCard';
import { getPublicTeamOwnerProfileById } from '@/lib/api/public';
import { TeamOwnerProfile } from '@/types/team-owner';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Handshake as HandshakeIcon
} from '@mui/icons-material';

interface TeamOwnerDetailPageProps {
  params: {
    id: string;
  };
}

export default function TeamOwnerDetailPage({ params }: TeamOwnerDetailPageProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<TeamOwnerProfile | null>(null);
  
  useEffect(() => {
    async function fetchTeamOwnerProfile() {
      try {
        setLoading(true);
        const fetchedProfile = await getPublicTeamOwnerProfileById(params.id);
        setProfile(fetchedProfile);
        setError(null);
      } catch (err) {
        console.error('Error fetching team owner profile:', err);
        setError('Failed to load team owner profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTeamOwnerProfile();
  }, [params.id]);
  
  // Render loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs 
            aria-label="breadcrumb"
            sx={{ 
              '& .MuiBreadcrumbs-ol': {
                alignItems: 'center'
              }
            }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Home
            </Link>
            <Link href="/team-owners" style={{ display: 'flex', alignItems: 'center' }}>
              <GroupsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Team Owners
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
              Profile
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 20 }} />
        </Box>
        
        <Skeleton 
          variant="rectangular" 
          height={500} 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }} 
        />
      </Container>
    );
  }
  
  // Render error message
  if (error || !profile) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs 
            aria-label="breadcrumb"
            sx={{ 
              '& .MuiBreadcrumbs-ol': {
                alignItems: 'center'
              }
            }}
          >
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Home
            </Link>
            <Link href="/team-owners" style={{ display: 'flex', alignItems: 'center' }}>
              <GroupsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Team Owners
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
              Profile
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Alert 
          severity="error"
          sx={{ 
            mb: 3,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {error || 'Profile not found'}
        </Alert>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            component={Link} 
            href="/team-owners" 
            startIcon={<ArrowBackIcon />}
            variant="contained"
            color="primary"
            sx={{ 
              borderRadius: 20,
              px: 3,
              py: 1,
              boxShadow: 2
            }}
          >
            Back to Team Owners
          </Button>
        </Box>
      </Container>
    );
  }
  
  // At this point, profile is guaranteed to be non-null
  return (
    <Container maxWidth="lg">
      {/* PBL League Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative', width: 60, height: 60 }}>
            <Image
              src="/pbel-volleyball-logo.png"
              alt="PBL Volleyball Logo"
              width={60}
              height={60}
              style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              PBEL CIty VOLLEYBALL
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              AND THROWBALL LEAGUE 2026
            </Typography>
          </Box>
        </Box>
        
        <Button
          component={Link}
          href="/sponsors"
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<HandshakeIcon />}
          sx={{ 
            borderRadius: 2,
            px: 2
          }}
        >
          View Sponsors
        </Button>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs 
          aria-label="breadcrumb"
          sx={{ 
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center'
            }
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link href="/team-owners" style={{ display: 'flex', alignItems: 'center' }}>
            <GroupsIcon fontSize="small" sx={{ mr: 0.5 }} />
            Team Owners
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            {profile.first_name} {profile.last_name}
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          component={Link} 
          href="/team-owners" 
          startIcon={<ArrowBackIcon />}
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: 20,
            px: 3,
            py: 1,
            boxShadow: 2
          }}
        >
          Back to Team Owners
        </Button>
        
        {profile.team_name && (
          <Chip 
            label={profile.team_name} 
            color="primary" 
            sx={{ 
              borderRadius: '20px',
              px: 2,
              py: 2.5,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 2
            }}
          />
        )}
      </Box>
      
      <Fade in={!loading} timeout={800}>
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 10px 40px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
            maxWidth: '900px',
            mx: 'auto',
            mb: 4
          }}
        >
          <TeamOwnerCard profile={profile} variant="full" />
        </Paper>
      </Fade>
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {profile.team_role && `${profile.team_role} • `}
          {profile.team_name && `${profile.team_name}`}
        </Typography>
        
        <Divider sx={{ width: '100px', mx: 'auto', my: 3, borderColor: theme.palette.primary.main }} />
      </Box>
    </Container>
  );
} 