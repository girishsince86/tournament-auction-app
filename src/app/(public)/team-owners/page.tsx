'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  TextField, 
  InputAdornment,
  Skeleton,
  Alert,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  alpha,
  Fade,
  Chip,
  Button
} from '@mui/material';
import { 
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterAlt as FilterIcon,
  Groups as GroupsIcon,
  Handshake as HandshakeIcon
} from '@mui/icons-material';
import { TeamOwnerCard } from '@/components/public/TeamOwnerCard';
import { getPublicTeamOwnerProfiles } from '@/lib/api/public';
import { TeamOwnerProfile } from '@/types/team-owner';
import Image from 'next/image';
import Link from 'next/link';

export default function TeamOwnersPage() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamOwners, setTeamOwners] = useState<TeamOwnerProfile[]>([]);
  const [filteredTeamOwners, setFilteredTeamOwners] = useState<TeamOwnerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Extract unique teams for filtering
  const teams = Array.from(
    new Set(teamOwners.map(owner => owner.team_name))
  ).filter(Boolean).sort() as string[];
  
  useEffect(() => {
    async function fetchTeamOwners() {
      try {
        setLoading(true);
        const profiles = await getPublicTeamOwnerProfiles();
        setTeamOwners(profiles);
        setFilteredTeamOwners(profiles);
        setError(null);
      } catch (err) {
        console.error('Error fetching team owner profiles:', err);
        setError('Failed to load team owner profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTeamOwners();
  }, []);
  
  // Filter team owners based on search query and team filter
  useEffect(() => {
    let filtered = [...teamOwners];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(owner => 
        owner.first_name.toLowerCase().includes(query) ||
        owner.last_name.toLowerCase().includes(query) ||
        (owner.team_name && owner.team_name.toLowerCase().includes(query)) ||
        (owner.team_role && owner.team_role.toLowerCase().includes(query)) ||
        (owner.sports_background && owner.sports_background.toLowerCase().includes(query)) ||
        (owner.profession && owner.profession.toLowerCase().includes(query)) ||
        (owner.sports_interests && owner.sports_interests.toLowerCase().includes(query)) ||
        (owner.family_impact && owner.family_impact.toLowerCase().includes(query)) ||
        (owner.philosophy && owner.philosophy.toLowerCase().includes(query))
      );
    }
    
    // Apply team filter
    if (teamFilter !== 'all') {
      filtered = filtered.filter(owner => owner.team_name === teamFilter);
    }
    
    setFilteredTeamOwners(filtered);
  }, [searchQuery, teamFilter, teamOwners]);
  
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'grid' | 'list' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  // Render loading skeletons
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ 
          mb: 3,
          textAlign: 'center',
          position: 'relative',
          py: 2
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            Team Owners
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              mb: 2,
              fontWeight: 400
            }}
          >
            Meet the passionate individuals behind our teams
          </Typography>
          <Divider sx={{ width: '100px', mx: 'auto', mb: 3, borderColor: theme.palette.primary.main }} />
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Skeleton variant="rectangular" width="80%" height={60} sx={{ borderRadius: 2 }} />
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton 
                variant="rectangular" 
                height={350} 
                sx={{ 
                  borderRadius: 2,
                  transform: item % 2 === 0 ? 'translateY(20px)' : 'none'
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
  
  // Render error message
  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ 
          mb: 3,
          textAlign: 'center',
          position: 'relative',
          py: 2
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            Team Owners
          </Typography>
        </Box>
        <Alert 
          severity="error"
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
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
      
      <Box sx={{ 
        mb: 3,
        textAlign: 'center',
        position: 'relative',
        py: 2
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1
          }}
        >
          Team Owners
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            maxWidth: '700px',
            mx: 'auto',
            mb: 2,
            fontWeight: 400
          }}
        >
          Meet the passionate individuals behind our teams
        </Typography>
        <Divider sx={{ width: '100px', mx: 'auto', mb: 2, borderColor: theme.palette.primary.main }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip 
            icon={<GroupsIcon />} 
            label={`${teamOwners.length} Team Owners`} 
            color="primary" 
            sx={{ 
              borderRadius: '20px',
              px: 1,
              fontWeight: 500,
              boxShadow: 1
            }}
          />
        </Box>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          mb: 4, 
          p: 2, 
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            placeholder="Search team owners..."
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }
              }
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="team-filter-label">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FilterIcon fontSize="small" />
                Team
              </Box>
            </InputLabel>
            <Select
              labelId="team-filter-label"
              id="team-filter"
              value={teamFilter}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FilterIcon fontSize="small" />
                  Team
                </Box>
              }
              onChange={(e) => setTeamFilter(e.target.value)}
              sx={{ 
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              <MenuItem value="all">All Teams</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team} value={team}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            sx={{ 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <ToggleButton 
              value="grid" 
              aria-label="grid view"
              sx={{ 
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }
              }}
            >
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton 
              value="list" 
              aria-label="list view"
              sx={{ 
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }
              }}
            >
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>
      
      {filteredTeamOwners.length === 0 ? (
        <Alert 
          severity="info"
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          No team owners found matching your search criteria.
        </Alert>
      ) : (
        <Fade in={!loading} timeout={800}>
          <Grid container spacing={viewMode === 'grid' ? 6 : 4}>
            {filteredTeamOwners.map((profile, index) => (
              <Grid 
                item 
                xs={12} 
                md={viewMode === 'list' ? 12 : 6} 
                lg={viewMode === 'list' ? 12 : 6}
                key={profile.id}
                sx={{ 
                  mb: viewMode === 'grid' ? 4 : 3
                }}
              >
                <TeamOwnerCard 
                  profile={profile} 
                  variant="compact"
                  showTeamName={true}
                />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
    </Container>
  );
} 