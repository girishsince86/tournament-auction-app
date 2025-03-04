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
  Card,
  CardContent,
  CardHeader,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  AvatarGroup
} from '@mui/material';
import { 
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Group as GroupIcon,
  EmojiEvents as TrophyIcon,
  SportsTennis as SportsIcon,
  Info as InfoIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';

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
  team_formation_method: string;
  description?: string;
  rules?: string[];
  team_count?: number;
}

interface Player {
  id: string;
  name: string;
  tshirt_number: string;
  profile_image_url: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
}

export default function FormatsPage() {
  const theme = useTheme();
  const [formats, setFormats] = useState<Format[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [formatTeams, setFormatTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

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

  // Fetch formats when tournament is selected
  useEffect(() => {
    if (!selectedTournament) return;

    const fetchFormats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tournament formats
        const response = await fetch(`/api/public/tournaments/${selectedTournament}/formats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch formats');
        }
        
        const data = await response.json();
        console.log('Formats data:', data);
        
        // Fetch team counts for each format
        const formatsWithTeamCounts = await Promise.all(
          (data.data || []).map(async (format: Format) => {
            try {
              const teamsResponse = await fetch(`/api/public/team-compositions?tournamentId=${selectedTournament}&formatId=${format.id}`);
              if (teamsResponse.ok) {
                const teamsData = await teamsResponse.json();
                console.log(`Teams for format ${format.name}:`, teamsData.data ? teamsData.data.length : 0);
                return {
                  ...format,
                  team_count: teamsData.data ? teamsData.data.length : 0,
                  // Mock rules for demonstration - in a real app, these would come from the API
                  rules: [
                    'Teams must have a minimum of 6 players',
                    'Each team must have at least one player from each position',
                    'Matches are played in best-of-three sets format',
                    'Points are awarded based on match results: 3 for a win, 1 for a loss'
                  ]
                };
              }
              return format;
            } catch (error) {
              console.error(`Error fetching teams for format ${format.id}:`, error);
              return format;
            }
          })
        );
        
        console.log('Formats with team counts:', formatsWithTeamCounts);
        setFormats(formatsWithTeamCounts);
      } catch (err) {
        console.error('Error fetching formats:', err);
        setError('Failed to load formats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormats();
  }, [selectedTournament]);

  // Filter formats based on search query
  const filteredFormats = formats.filter(format => {
    const matchesSearch = searchQuery === '' || 
      format.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format.format_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Handle tournament change
  const handleTournamentChange = (event: SelectChangeEvent) => {
    setSelectedTournament(event.target.value);
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
  const handleOpenDialog = async (format: Format) => {
    setSelectedFormat(format);
    setDialogOpen(true);
    setLoadingTeams(true);
    
    try {
      const response = await fetch(`/api/public/team-compositions?tournamentId=${selectedTournament}&formatId=${format.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormatTeams(data.data || []);
      } else {
        setFormatTeams([]);
      }
    } catch (err) {
      console.error('Error fetching teams for format:', err);
      setFormatTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Format type to display name
  const formatTypeToDisplayName = (formatType: string) => {
    switch (formatType) {
      case 'LEAGUE':
        return 'League';
      case 'KNOCKOUT':
        return 'Knockout';
      case 'GROUP_STAGE':
        return 'Group Stage';
      case 'ROUND_ROBIN':
        return 'Round Robin';
      case 'VOLLEYBALL':
        return 'Volleyball';
      case 'THROWBALL':
        return 'Throwball';
      default:
        return formatType.replace(/_/g, ' ').toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  // Team formation method to display name
  const teamFormationMethodToDisplayName = (method: string) => {
    switch (method) {
      case 'AUCTION':
        return 'Auction';
      case 'DRAFT':
        return 'Draft';
      case 'MANUAL':
        return 'Manual Assignment';
      case 'RANDOM':
        return 'Random Assignment';
      default:
        return method.replace(/_/g, ' ').toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  // Format card component
  const FormatCard = ({ format }: { format: Format }) => {
    return (
      <Card 
        elevation={3} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8],
          }
        }}
      >
        <CardHeader
          title={format.name}
          subheader={formatTypeToDisplayName(format.format_type)}
          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
          subheaderTypographyProps={{ variant: 'body2' }}
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        />
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Format Details
              </Typography>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <GroupIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        Team Formation: <strong>{teamFormationMethodToDisplayName(format.team_formation_method)}</strong>
                      </Typography>
                    } 
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TrophyIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        Teams Participating: <strong>{format.team_count || 'TBD'}</strong>
                      </Typography>
                    } 
                  />
                </ListItem>
              </List>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Format Rules
              </Typography>
              {format.rules && format.rules.length > 0 ? (
                <Accordion 
                  elevation={0} 
                  sx={{ 
                    '&:before': { display: 'none' },
                    bgcolor: alpha(theme.palette.background.paper, 0.5)
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ p: 0, minHeight: 40 }}
                  >
                    <Typography variant="body2">View Rules</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1, pt: 0 }}>
                    <List dense disablePadding>
                      {format.rules.map((rule, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <FormatListNumberedIcon fontSize="small" color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography variant="body2">
                                {rule}
                              </Typography>
                            } 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific rules defined for this format.
                </Typography>
              )}
            </Box>
            
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                fullWidth
                onClick={() => handleOpenDialog(format)}
                startIcon={<GroupIcon />}
              >
                View Teams
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Render formats based on view mode
  const renderFormats = () => {
    if (loading) {
      return (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Skeleton variant="rectangular" height={350} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (filteredFormats.length === 0) {
      return (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7)
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <InfoIcon fontSize="large" color="action" />
          </Box>
          <Typography variant="h6" gutterBottom>
            No Formats Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery 
              ? "No formats match your search criteria. Try adjusting your search."
              : "There are no formats available for the selected tournament."}
          </Typography>
        </Paper>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Grid container spacing={3}>
          {filteredFormats.map((format) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={format.id}>
              <FormatCard format={format} />
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Format Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team Formation</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teams</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFormats.map((format) => (
                <TableRow key={format.id} hover>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {format.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={formatTypeToDisplayName(format.format_type)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {teamFormationMethodToDisplayName(format.team_formation_method)}
                  </TableCell>
                  <TableCell>
                    {format.team_count || 'TBD'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      onClick={() => handleOpenDialog(format)}
                      startIcon={<GroupIcon />}
                    >
                      View Teams
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
            <SportsIcon fontSize="large" />
            Tournament Formats
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore the different tournament formats and their rules
          </Typography>
        </Box>
        
        <FormControl 
          size="small" 
          sx={{ minWidth: { xs: '100%', sm: 250 } }}
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
          placeholder="Search formats..."
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
      
      {renderFormats()}
      
      {/* Format Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedFormat && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="div">
                  {selectedFormat.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {formatTypeToDisplayName(selectedFormat.format_type)}
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" />
                  Format Details
                </Typography>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Team Formation Method
                      </Typography>
                      <Typography variant="body1">
                        {teamFormationMethodToDisplayName(selectedFormat.team_formation_method)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Teams Participating
                      </Typography>
                      <Typography variant="body1">
                        {selectedFormat.team_count || 'TBD'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
              
              {selectedFormat.rules && selectedFormat.rules.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormatListNumberedIcon color="primary" />
                    Format Rules
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <List dense>
                      {selectedFormat.rules.map((rule, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <FormatListNumberedIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={rule} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Box>
              )}
              
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" />
                  Teams
                </Typography>
                
                {loadingTeams ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Skeleton variant="rectangular" height={100} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading teams...
                    </Typography>
                  </Box>
                ) : formatTeams.length > 0 ? (
                  <Grid container spacing={2}>
                    {formatTeams.map((team) => (
                      <Grid item xs={12} sm={6} md={4} key={team.id}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {team.name}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Players: {team.players.length}
                          </Typography>
                          <AvatarGroup max={5} sx={{ justifyContent: 'flex-start', mt: 1 }}>
                            {team.players.map((player) => (
                              <Tooltip key={player.id} title={player.name}>
                                <Avatar 
                                  src={player.profile_image_url || undefined}
                                  sx={{ width: 35, height: 35 }}
                                >
                                  {player.tshirt_number || player.name.charAt(0)}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              component={Link}
                              href={`/teams?tournamentId=${selectedTournament}&formatId=${selectedFormat.id}`}
                            >
                              View Team Details
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                    <Typography variant="body1" gutterBottom>
                      No teams found for this format.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Teams will be added as they are formed.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                href={`/teams?tournamentId=${selectedTournament}&formatId=${selectedFormat.id}`}
              >
                View All Teams
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
} 