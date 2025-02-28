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
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import { PlayerCard } from '@/components/public/PlayerCard';
import { PlayerListView } from '@/components/public/PlayerListView';
import type { PlayerCardProps } from '@/components/public/PlayerCard';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>('');
  
  // Hardcoded tournament ID
  const tournamentId = '11111111-1111-1111-1111-111111111111';
  
  // Fetch players and categories when component mounts
  useEffect(() => {
    const fetchPlayersAndCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Add timestamp as cache-busting parameter
        const timestamp = Date.now();
        
        // Fetch players
        const playersResponse = await fetch(`/api/public/players?tournamentId=${tournamentId}&_t=${timestamp}`);
        if (!playersResponse.ok) {
          throw new Error('Failed to fetch players');
        }
        
        const playersData = await playersResponse.json();
        setPlayers(playersData.players || []);
        
        // Fetch categories with the same timestamp
        const categoriesResponse = await fetch(`/api/public/categories?tournamentId=${tournamentId}&_t=${timestamp}`);
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load player data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayersAndCategories();
  }, []);
  
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
    
    // Filter by category
    if (selectedCategory === null) {
      return !player.category_id;
    } else if (selectedCategory && selectedCategory !== '') {
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
  
  // Count players with no category
  const playersWithNoCategory = players.filter(player => !player.category_id).length;
  const noCategoryPercentage = players.length > 0 ? Math.round((playersWithNoCategory / players.length) * 100) : 0;
  
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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Volleyball Players
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse and discover the talented players participating in our tournaments
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
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
            
            {/* No category chip */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: selectedCategory === null ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                onClick={() => setSelectedCategory(selectedCategory === null ? '' : null)}
              >
                <Chip 
                  label="No Category"
                  color="default"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {playersWithNoCategory}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Players ({noCategoryPercentage}%)
                </Typography>
              </Paper>
            </Grid>
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