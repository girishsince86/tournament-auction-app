'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  InputAdornment,
  Skeleton,
  Alert,
  Chip,
  Stack,
  Divider,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  alpha,
  Button
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Handshake as HandshakeIcon
} from '@mui/icons-material';
import { PlayerCard } from '@/components/public/PlayerCard';
import { PlayerListView } from '@/components/public/PlayerListView';
import type { PlayerCardProps } from '@/components/public/PlayerCard';
import Image from 'next/image';
import Link from 'next/link';

// Define types for API responses
interface Tournament {
  id: string;
  name: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  category_type: string;
  base_points: number;
  min_points: number;
  max_points: number | null;
  description: string | null;
  skill_level: string;
}

interface CategoryWithStats extends Category {
  playerCount: number;
  percentage: number;
}

// Define the skill level options
const SKILL_LEVELS = [
  { value: 'RECREATIONAL_C', label: 'Recreational (C)' },
  { value: 'INTERMEDIATE_B', label: 'Intermediate (B)' },
  { value: 'UPPER_INTERMEDIATE_BB', label: 'Upper Intermediate (BB)' },
  { value: 'COMPETITIVE_A', label: 'Competitive (A)' },
];

// Define the position options
const POSITIONS = [
  { value: 'P1_RIGHT_BACK', label: 'Right Back' },
  { value: 'P2_RIGHT_FRONT', label: 'Right Front' },
  { value: 'P3_MIDDLE_FRONT', label: 'Middle Front' },
  { value: 'P4_LEFT_FRONT', label: 'Left Front' },
  { value: 'P5_LEFT_BACK', label: 'Left Back' },
  { value: 'P6_MIDDLE_BACK', label: 'Middle Back' },
];

export default function PlayersPage() {
  const theme = useTheme();
  const [players, setPlayers] = useState<PlayerCardProps['player'][]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Hardcoded tournament ID
  const tournamentId = '11111111-1111-1111-1111-111111111111';
  
  // Fetch players and categories when component mounts
  useEffect(() => {
    const fetchPlayersAndCategories = async (retryCount = 0) => {
      setLoading(true);
      setError(null);
      
      try {
        // Add timestamp as cache-busting parameter
        const timestamp = Date.now();
        
        // Fetch players
        console.log(`Fetching players data (attempt ${retryCount + 1})...`);
        const playersResponse = await fetch(`/api/public/players?tournamentId=${tournamentId}&_t=${timestamp}`);
        
        if (!playersResponse.ok) {
          const errorText = await playersResponse.text();
          console.error(`Players API error (${playersResponse.status}):`, errorText);
          
          // Try to parse the error response
          let errorDetails = 'Unknown error';
          try {
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson.error || errorJson.details || errorText;
          } catch (e) {
            // If parsing fails, use the raw text
            errorDetails = errorText;
          }
          
          throw new Error(`Failed to fetch players: ${errorDetails}`);
        }
        
        const playersData = await playersResponse.json();
        console.log(`Successfully fetched ${playersData.players?.length || 0} players`);
        setPlayers(playersData.players || []);
        
        // Fetch categories with the same timestamp
        console.log(`Fetching categories data (attempt ${retryCount + 1})...`);
        const categoriesResponse = await fetch(`/api/public/categories?tournamentId=${tournamentId}&_t=${timestamp}`);
        
        if (!categoriesResponse.ok) {
          const errorText = await categoriesResponse.text();
          console.error(`Categories API error (${categoriesResponse.status}):`, errorText);
          
          // Try to parse the error response
          let errorDetails = 'Unknown error';
          try {
            const errorJson = JSON.parse(errorText);
            errorDetails = errorJson.error || errorJson.details || errorText;
          } catch (e) {
            // If parsing fails, use the raw text
            errorDetails = errorText;
          }
          
          throw new Error(`Failed to fetch categories: ${errorDetails}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        console.log(`Successfully fetched ${categoriesData.categories?.length || 0} categories`);
        setCategories(categoriesData.categories || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // Implement retry logic (up to 3 attempts)
        if (retryCount < 2) {
          console.log(`Retrying fetch (attempt ${retryCount + 2} of 3)...`);
          setTimeout(() => fetchPlayersAndCategories(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        // After all retries failed, show error to user
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to load player data: ${errorMessage}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayersAndCategories();
  }, [tournamentId]);
  
  // Function to manually retry loading data
  const handleRetryFetch = () => {
    console.log('Manually retrying data fetch...');
    setLoading(true);
    setError(null);
    
    // Add a small delay before retrying
    setTimeout(() => {
      const timestamp = Date.now();
      
      // Fetch players and categories again
      fetch(`/api/public/players?tournamentId=${tournamentId}&_t=${timestamp}`)
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Failed to fetch players: ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log(`Successfully fetched ${data.players?.length || 0} players`);
          setPlayers(data.players || []);
          
          // Now fetch categories
          return fetch(`/api/public/categories?tournamentId=${tournamentId}&_t=${timestamp}`);
        })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Failed to fetch categories: ${text}`);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log(`Successfully fetched ${data.categories?.length || 0} categories`);
          setCategories(data.categories || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error in manual retry:', err);
          setError(`Failed to load data: ${err.message}. Please try again later.`);
          setLoading(false);
        });
    }, 500);
  };
  
  // Function to run diagnostics
  const handleRunDiagnostics = async () => {
    try {
      setLoading(true);
      setError('Running diagnostics...');
      
      // Call the diagnostics endpoint
      const response = await fetch('/api/diagnostics/supabase');
      if (!response.ok) {
        throw new Error('Failed to run diagnostics');
      }
      
      const diagnosticData = await response.json();
      console.log('Diagnostic results:', diagnosticData);
      
      // Format diagnostic results for display
      const isHealthy = diagnosticData.supabaseConnection.isHealthy;
      const schemaValid = diagnosticData.databaseSchema.isValid;
      const envVarsPresent = Object.values(diagnosticData.environmentVariables).every(Boolean);
      
      let diagnosticMessage = '';
      
      if (!envVarsPresent) {
        diagnosticMessage = 'Missing environment variables. Please check your .env file.';
      } else if (!isHealthy) {
        diagnosticMessage = `Database connection error: ${diagnosticData.supabaseConnection.message}`;
      } else if (!schemaValid) {
        diagnosticMessage = `Database schema issue: ${diagnosticData.databaseSchema.message}`;
      } else {
        diagnosticMessage = 'Diagnostics completed successfully. Database connection is healthy.';
        // If diagnostics are successful, retry fetching data
        handleRetryFetch();
        return;
      }
      
      setError(`${diagnosticMessage} Please contact support if the issue persists.`);
    } catch (err) {
      console.error('Error running diagnostics:', err);
      setError(`Failed to run diagnostics: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter players based on search and filter criteria
  const filteredPlayers = players.filter(player => {
    // Filter by search query (name)
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by position
    if (selectedPosition && player.player_position !== selectedPosition) {
      return false;
    }
    
    // Filter by skill level
    if (selectedSkillLevel && player.skill_level !== selectedSkillLevel) {
      return false;
    }
    
    // Filter by category - modified to remove special handling for null category
    if (selectedCategory && selectedCategory !== '') {
      return player.category_id === selectedCategory;
    }
    
    return true;
  });
  
  // Calculate category statistics
  const categoryStats: CategoryWithStats[] = categories.map(category => {
    const playersInCategory = players.filter(player => player.category_id === category.id).length;
    const percentage = players.length > 0 ? Math.round((playersInCategory / players.length) * 100) : 0;
    
    return {
      ...category,
      playerCount: playersInCategory,
      percentage
    };
  });
  
  // Sort categories by player count (descending)
  const sortedCategoryStats = [...categoryStats].sort((a, b) => b.playerCount - a.playerCount);
  
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'grid' | 'list' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
      
      <Box sx={{ mb: 4, textAlign: 'center' }}>
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
          Volleyball Players
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
          Browse and discover the talented players participating in our tournaments
        </Typography>
        <Divider sx={{ width: '100px', mx: 'auto', mb: 2, borderColor: theme.palette.primary.main }} />
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRunDiagnostics}
                disabled={loading}
              >
                Diagnose
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetryFetch}
                disabled={loading}
              >
                Retry
              </Button>
            </Box>
          }
        >
          {error}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Filters
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="position-select-label">Position</InputLabel>
                <Select
                  labelId="position-select-label"
                  value={selectedPosition}
                  label="Position"
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  <MenuItem value="">All Positions</MenuItem>
                  {POSITIONS.map((position) => (
                    <MenuItem key={position.value} value={position.value}>
                      {position.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="skill-level-select-label">Skill Level</InputLabel>
                <Select
                  labelId="skill-level-select-label"
                  value={selectedSkillLevel}
                  label="Skill Level"
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                >
                  <MenuItem value="">All Skill Levels</MenuItem>
                  {SKILL_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedCategory || ''}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by player name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        {/* Category statistics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Player Categories
          </Typography>
          
          <Grid container spacing={2}>
            {sortedCategoryStats.map((category) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={category.id}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    bgcolor: selectedCategory === category.id ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                >
                  <Chip 
                    label={category.name}
                    color={
                      category.category_type === 'LEVEL_1' ? 'primary' : 
                      category.category_type === 'LEVEL_2' ? 'secondary' : 
                      'default'
                    }
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {category.playerCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Players ({category.percentage}%)
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
      
      {/* Results count and view toggle */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          px: 1
        }}
      >
        <Typography variant="h6">
          {loading ? 'Loading players...' : `${filteredPlayers.length} Players Found`}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            View:
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <Tooltip title="Card View">
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="List View">
              <ToggleButton value="list" aria-label="list view">
                <ListViewIcon />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      {loading ? (
        viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {[...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Skeleton variant="text" width={150} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                    <TableCell align="right"><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell align="center"><Skeleton variant="text" width={100} /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(8)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Skeleton variant="text" width={120} />
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" width={60} /></TableCell>
                      <TableCell align="center"><Skeleton variant="rectangular" width={100} height={30} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      ) : filteredPlayers.length === 0 ? (
        <Alert severity="info">
          No players found matching your criteria. Try adjusting your filters.
        </Alert>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredPlayers.map((player) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
              <PlayerCard player={player} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <PlayerListView players={filteredPlayers} />
      )}
    </Container>
  );
} 