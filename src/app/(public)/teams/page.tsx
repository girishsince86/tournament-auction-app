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
  SelectChangeEvent,
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
  Button,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  SportsTennis as SportsIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Define types for API responses
interface Tournament {
  id: string;
  name: string;
  is_active: boolean;
}

interface Format {
  id: string;
  name: string;
  format_type: string;
}

interface Player {
  id: string;
  name: string;
  tshirt_number: string;
  tshirt_name: string;
  apartment_number: string;
  profile_image_url: string;
  position: string;
  skill_level: string;
}

interface Team {
  id: string;
  name: string;
  format_id: string;
  format_name: string;
  format_type: string;
  tournament_id: string;
  players: Player[];
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

// TabPanel component for tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function to get position label
const getPositionLabel = (position: string) => {
  const found = POSITIONS.find(p => p.value === position);
  return found ? found.label : position;
};

// Helper function to get skill level label
const getSkillLevelLabel = (skillLevel: string) => {
  const found = SKILL_LEVELS.find(s => s.value === skillLevel);
  return found ? found.label : skillLevel;
};

// Team Card Component
const TeamCard = ({ team }: { team: Team }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 8
        }
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {team.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {team.format_name}
        </Typography>
      </Box>
      
      {/* Player Avatars Preview */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
        {team.players.map((player) => (
          <Tooltip key={player.id} title={player.name}>
            <Avatar 
              src={player.profile_image_url || undefined}
              sx={{ 
                width: 45, 
                height: 45,
                border: '2px solid',
                borderColor: 'primary.main',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  zIndex: 1
                }
              }}
            >
              {player.tshirt_number || player.name.charAt(0)}
            </Avatar>
          </Tooltip>
        ))}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 1.5, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={handleExpandClick}
          endIcon={expanded ? <ExpandMoreIcon style={{ transform: 'rotate(180deg)' }} /> : <ExpandMoreIcon />}
        >
          {expanded ? "Hide Details" : "View Details"}
        </Button>
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List sx={{ p: 0 }}>
          {team.players.map((player) => (
            <ListItem 
              key={player.id} 
              divider
              sx={{ 
                px: 2, 
                py: 1.5,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  src={player.profile_image_url || undefined}
                  sx={{ 
                    bgcolor: 'primary.light',
                    width: 50,
                    height: 50,
                    mr: 1,
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {player.tshirt_number || player.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {player.name}
                    </Typography>
                    <Chip 
                      label={player.tshirt_number} 
                      size="small" 
                      color="primary" 
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {player.position && (
                        <Chip 
                          label={getPositionLabel(player.position)} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      {player.skill_level && (
                        <Chip 
                          label={getSkillLevelLabel(player.skill_level)} 
                          size="small" 
                          variant="outlined"
                          color={
                            player.skill_level === 'BEGINNER' ? 'info' :
                            player.skill_level === 'INTERMEDIATE' ? 'success' :
                            player.skill_level === 'ADVANCED' ? 'warning' : 'default'
                          }
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default function TeamsPage() {
  const theme = useTheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/public/tournaments');
        if (!response.ok) {
          throw new Error('Failed to fetch tournaments');
        }
        const data = await response.json();
        setTournaments(data.tournaments || []);
        
        // Set default tournament if available
        if (data.tournaments && data.tournaments.length > 0) {
          const activeTournament = data.currentTournament || data.tournaments[0];
          setSelectedTournament(activeTournament.id);
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments. Please try again later.');
      }
    };

    fetchTournaments();
  }, []);

  // Fetch teams when tournament is selected
  useEffect(() => {
    if (!selectedTournament) return;

    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch team compositions
        const response = await fetch(`/api/public/team-compositions?tournamentId=${selectedTournament}${selectedFormat ? `&formatId=${selectedFormat}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        
        const data = await response.json();
        console.log('Teams data:', data);
        setTeams(data.data || []);
        
        // Extract unique formats from teams
        const uniqueFormats = Array.from(
          new Map(
            (data.data || []).map((team: Team) => [
              team.format_id,
              { id: team.format_id, name: team.format_name, format_type: team.format_type }
            ])
          ).values()
        ) as Format[];
        
        console.log('Unique formats from teams:', uniqueFormats);
        setFormats(uniqueFormats);
        
        // If we don't have any formats from teams, fetch all formats for the tournament
        if (uniqueFormats.length === 0) {
          try {
            const formatsResponse = await fetch(`/api/public/tournaments/${selectedTournament}/formats`);
            if (formatsResponse.ok) {
              const formatsData = await formatsResponse.json();
              console.log('All formats from API:', formatsData);
              if (formatsData.data && formatsData.data.length > 0) {
                setFormats(formatsData.data);
              }
            }
          } catch (err) {
            console.error('Error fetching all formats:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedTournament, selectedFormat]);

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchQuery === '' || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.players.some(player => player.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Handle tournament change
  const handleTournamentChange = (event: SelectChangeEvent) => {
    setSelectedTournament(event.target.value);
    setSelectedFormat(''); // Reset format when tournament changes
  };

  // Handle format change
  const handleFormatChange = (event: SelectChangeEvent) => {
    setSelectedFormat(event.target.value);
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle view mode change
  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Handle dialog open
  const handleOpenDialog = (team: Team) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Render teams based on view mode
  const renderTeams = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (filteredTeams.length === 0) {
      return (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7)
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Teams Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery 
              ? "No teams match your search criteria. Try adjusting your filters."
              : "There are no teams available for the selected tournament and format."}
          </Typography>
        </Paper>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Grid container spacing={3}>
          {filteredTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
              <TeamCard team={team} />
            </Grid>
          ))}
        </Grid>
      );
    } else {
      return (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Format</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Players</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {team.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={team.format_name} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <AvatarGroup max={8} sx={{ justifyContent: 'flex-start' }}>
                      {team.players.map((player) => (
                        <Tooltip key={player.id} title={player.name}>
                          <Avatar 
                            src={player.profile_image_url || undefined}
                            sx={{ 
                              width: 35, 
                              height: 35,
                              border: '2px solid',
                              borderColor: 'primary.main'
                            }}
                          >
                            {player.name.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleOpenDialog(team)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <GroupIcon fontSize="large" />
            Teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse all teams and their players in the tournament
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', md: 'auto' }
          }}
        >
          <FormControl 
            size="small" 
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          >
            <InputLabel id="tournament-select-label">Tournament</InputLabel>
            <Select
              labelId="tournament-select-label"
              value={selectedTournament}
              label="Tournament"
              onChange={handleTournamentChange}
            >
              {tournaments.map((tournament) => (
                <MenuItem key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl 
            size="small" 
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          >
            <InputLabel id="format-select-label">Format</InputLabel>
            <Select
              labelId="format-select-label"
              value={selectedFormat}
              label="Format"
              onChange={handleFormatChange}
            >
              <MenuItem value="">All Formats</MenuItem>
              {formats.map((format) => (
                <MenuItem key={format.id} value={format.id}>
                  {format.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center',
          gap: 2
        }}
      >
        <TextField
          placeholder="Search teams or players..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0, sm: 'auto' } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            View:
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <Tooltip title="Grid View">
                <GridViewIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list">
              <Tooltip title="List View">
                <ListViewIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {renderTeams()}
      
      {/* Team Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedTeam && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="div">
                  {selectedTeam.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {selectedTeam.format_name}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseDialog}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                Team Players
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedTeam.players.map((player) => (
                  <Grid item xs={12} sm={6} md={4} key={player.id}>
                    <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={player.profile_image_url || undefined}
                        sx={{ 
                          width: 60, 
                          height: 60,
                          border: '2px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        {player.tshirt_number || player.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {player.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          <Chip 
                            label={`#${player.tshirt_number}`} 
                            size="small" 
                            color="primary" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          {player.position && (
                            <Chip 
                              label={getPositionLabel(player.position)} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          {player.skill_level && (
                            <Chip 
                              label={getSkillLevelLabel(player.skill_level)} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
} 