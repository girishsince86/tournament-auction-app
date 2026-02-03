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
  Divider,
  Paper,
  alpha,
  Fade,
  Chip,
  Button,
  Zoom,
  Grow,
  IconButton,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { 
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Groups as GroupsIcon,
  Handshake as HandshakeIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  SortByAlpha as SortByAlphaIcon
} from '@mui/icons-material';
import { OrganizerCard } from '@/components/public/OrganizerCard';
import { getPublicOrganizerProfiles } from '@/lib/api/public';
import { OrganizerProfile } from '@/types/organizer';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Sort organizers alphabetically by first name
const sortOrganizers = (organizers: OrganizerProfile[]): OrganizerProfile[] => {
  return [...organizers].sort((a, b) => {
    const nameA = a.first_name.toLowerCase();
    const nameB = b.first_name.toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

export default function OrganizersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState<OrganizerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearch, setShowSearch] = useState(false);
  
  useEffect(() => {
    async function fetchOrganizers() {
      try {
        setLoading(true);
        const profiles = await getPublicOrganizerProfiles();
        // Sort organizers alphabetically by first name
        const sortedProfiles = sortOrganizers(profiles);
        setOrganizers(sortedProfiles);
        setFilteredOrganizers(sortedProfiles);
        setError(null);
      } catch (err) {
        console.error('Error fetching organizer profiles:', err);
        setError('Failed to load organizer profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrganizers();
  }, []);
  
  // Filter organizers based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = organizers.filter(organizer => 
        organizer.first_name.toLowerCase().includes(query) ||
        (organizer.last_name && organizer.last_name.toLowerCase().includes(query)) ||
        (organizer.profession && organizer.profession.toLowerCase().includes(query)) ||
        (organizer.sports_background && organizer.sports_background.toLowerCase().includes(query)) ||
        (organizer.philosophy && organizer.philosophy.toLowerCase().includes(query))
      );
      setFilteredOrganizers(filtered);
    } else {
      setFilteredOrganizers(organizers);
    }
  }, [searchQuery, organizers]);
  
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'grid' | 'list' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };
  
  // Render loading skeletons
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ 
          mb: 5,
          textAlign: 'center',
          position: 'relative',
          py: 4
        }}>
          <Skeleton 
            variant="rectangular" 
            width="60%" 
            height={60} 
            sx={{ 
              borderRadius: 2,
              mx: 'auto',
              mb: 2
            }} 
          />
          <Skeleton 
            variant="rectangular" 
            width="40%" 
            height={30} 
            sx={{ 
              borderRadius: 2,
              mx: 'auto',
              mb: 3
            }} 
          />
          <Skeleton 
            variant="rectangular" 
            width={100} 
            height={4} 
            sx={{ 
              borderRadius: 2,
              mx: 'auto',
              mb: 4
            }} 
          />
        </Box>
        
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="rectangular" width="30%" height={50} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width="15%" height={50} sx={{ borderRadius: 2 }} />
        </Box>
        
        <Grid container spacing={4}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3}
              key={index}
            >
              <Skeleton 
                variant="rectangular" 
                height={450} 
                sx={{ 
                  borderRadius: 3,
                  transform: index % 2 === 0 ? 'translateY(20px)' : 'none',
                  opacity: 1 - (index * 0.1)
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
          mb: 5,
          textAlign: 'center',
          position: 'relative',
          py: 4
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
              mb: 2
            }}
          >
            Organizers
          </Typography>
        </Box>
        <Zoom in={true}>
          <Alert 
            severity="error"
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              borderRadius: 3,
              boxShadow: theme.shadows[5],
              p: 2
            }}
          >
            <Typography variant="h6" gutterBottom>Something went wrong</Typography>
            {error}
          </Alert>
        </Zoom>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      {/* PBL League Banner */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={3}
          sx={{
            mb: 5,
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              zIndex: 1
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 2 }}>
            <Box 
              sx={{ 
                position: 'relative', 
                width: { xs: 50, md: 60 }, 
                height: { xs: 50, md: 60 },
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                  },
                },
              }}
            >
              <Image
                src="/pbel-volleyball-logo.png"
                alt="PBL Volleyball Logo"
                width={60}
                height={60}
                style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  lineHeight: 1.2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                PBEL CIty VOLLEYBALL
              </Typography>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' }
                }}
              >
                AND THROWBALL LEAGUE 2026
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip 
              label="Tournament Organizers" 
              color="primary" 
              sx={{ 
                fontWeight: 700,
                px: { xs: 1, md: 2 },
                py: { xs: 2, md: 3 },
                borderRadius: 3,
                fontSize: { xs: '0.8rem', md: '1rem' },
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }} 
            />
          </Box>
          
          {/* Decorative elements */}
          <Box 
            sx={{ 
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
              top: '-150px',
              right: '-100px',
              zIndex: 0
            }} 
          />
          <Box 
            sx={{ 
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 70%)`,
              bottom: '-100px',
              left: '10%',
              zIndex: 0
            }} 
          />
        </Paper>
      </Fade>
      
      {/* Page Header */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ 
          mb: 5,
          textAlign: 'center',
          position: 'relative',
          py: 2
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            Meet Our Organizers
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              mb: 3,
              fontWeight: 400,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
              lineHeight: 1.6
            }}
          >
            The dedicated individuals who make this tournament possible through their passion, 
            expertise, and commitment to excellence
          </Typography>
          <Divider sx={{ 
            width: '120px', 
            mx: 'auto', 
            mb: 4, 
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
            borderRadius: 1
          }} />
        </Box>
      </Fade>
      
      {/* Search and View Controls */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 5,
          flexWrap: 'wrap',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(8px)',
          p: 2,
          borderRadius: 3,
          boxShadow: showSearch ? theme.shadows[3] : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {isMobile ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              {showSearch ? (
                <Fade in={showSearch}>
                  <TextField
                    placeholder="Search organizers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }
                    }}
                  />
                </Fade>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Tooltip title="Search organizers">
                    <IconButton 
                      onClick={() => setShowSearch(true)}
                      sx={{ 
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      borderRadius: 3,
                      '& .MuiToggleButton-root': {
                        borderRadius: 0,
                        '&:first-of-type': {
                          borderTopLeftRadius: 12,
                          borderBottomLeftRadius: 12,
                        },
                        '&:last-of-type': {
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                        },
                      }
                    }}
                  >
                    <ToggleButton value="grid" aria-label="grid view">
                      <GridViewIcon />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ListViewIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }
                }}
                sx={{ 
                  minWidth: { xs: '100%', sm: '300px' },
                  flex: { xs: '1 1 100%', sm: '0 1 auto' }
                }}
              />
              
              <Tooltip title="Sorted alphabetically by first name">
                <Chip 
                  icon={<SortByAlphaIcon fontSize="small" />} 
                  label="A-Z" 
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3,
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                  }}
                />
              </Tooltip>
            </Box>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
              sx={{ 
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderRadius: 3,
                '& .MuiToggleButton-root': {
                  borderRadius: 0,
                  '&:first-of-type': {
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  },
                }
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </>
        )}
        
        {/* Search results count */}
        {searchQuery && (
          <Fade in={true}>
            <Box 
              sx={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Found {filteredOrganizers.length} {filteredOrganizers.length === 1 ? 'organizer' : 'organizers'} matching "{searchQuery}"
              </Typography>
              
              <Button 
                size="small" 
                color="primary" 
                onClick={() => setSearchQuery('')}
                sx={{ textTransform: 'none' }}
              >
                Clear search
              </Button>
            </Box>
          </Fade>
        )}
      </Box>
      
      {/* Organizers Grid */}
      {filteredOrganizers.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4}>
            {filteredOrganizers.map((organizer, index) => (
              <Grid 
                item 
                xs={12} 
                sm={viewMode === 'list' ? 12 : 6} 
                md={viewMode === 'list' ? 12 : 4} 
                lg={viewMode === 'list' ? 12 : 3}
                key={organizer.id}
                component={motion.div}
                variants={itemVariants}
                style={{ display: 'flex' }}
              >
                <OrganizerCard 
                  profile={organizer} 
                  variant={viewMode === 'list' ? 'full' : 'compact'}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      ) : (
        <Fade in={true} timeout={800}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 10,
            px: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 3,
            border: `1px dashed ${alpha(theme.palette.text.secondary, 0.2)}`,
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No organizers found matching your search.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search terms or clear the search to see all organizers.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setSearchQuery('')}
              sx={{ 
                mt: 2,
                borderRadius: 3,
                px: 3,
                py: 1,
                boxShadow: theme.shadows[5]
              }}
            >
              View All Organizers
            </Button>
          </Box>
        </Fade>
      )}
      
      {/* Bottom spacing */}
      <Box sx={{ height: 60 }} />
    </Container>
  );
} 