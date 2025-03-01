'use client';

import '@/lib/mui-license'; // Import MUI license utility
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  DataGridPro,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridRowSelectionModel,
} from '@mui/x-data-grid-pro';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Category as CategoryIcon,
  BuildCircle as BuildCircleIcon,
  Refresh as RefreshIcon,
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTournaments } from '@/hooks/useTournaments';
import toast from 'react-hot-toast';
import { formatPointsInCrores } from '@/lib/utils/format';

// Define types
interface PlayerCategory {
  id: string;
  tournament_id: string;
  name: string;
  category_type: string;
  base_points: number;
  min_points: number;
  max_points: number | null;
  description: string | null;
  skill_level: string;
  created_at: string;
  updated_at: string;
}

interface Player {
  id: string;
  name: string;
  player_position: string;
  skill_level: string;
  base_price: number;
  status: string;
  profile_image_url: string | null;
  category_id: string | null;
  category: {
    id: string;
    category_type: string;
    name: string;
    base_points: number;
  } | null;
}

export default function PlayerCategoriesPage() {
  const theme = useTheme();
  const { tournaments, currentTournament, isLoading: isLoadingTournaments } = useTournaments();
  
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [categories, setCategories] = useState<PlayerCategory[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<PlayerCategory> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState<GridRowSelectionModel>([]);
  const [openBulkUpdateDialog, setOpenBulkUpdateDialog] = useState(false);
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState<string>('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [categorySortOrder, setCategorySortOrder] = useState<'count' | 'name'>('count');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zeroBasePointsInfo, setZeroBasePointsInfo] = useState<{
    zeroCount: number;
    nullCount: number;
    totalIssues: number;
    zeroBasePointsCategories: any[];
    nullBasePointsCategories: any[];
  } | null>(null);
  
  const [isCheckingZeroBasePoints, setIsCheckingZeroBasePoints] = useState(false);

  // Set the selected tournament when currentTournament changes
  useEffect(() => {
    if (currentTournament) {
      setSelectedTournament(currentTournament.id);
    }
  }, [currentTournament]);

  // Fetch categories when selected tournament changes
  useEffect(() => {
    if (selectedTournament) {
      fetchCategories();
      fetchPlayers();
    }
  }, [selectedTournament]);

  const fetchCategories = useCallback(async () => {
    if (!selectedTournament) return;
    
    try {
      setLoadingCategories(true);
      setError(null);
      setIsRefreshing(true);
      
      const response = await fetch(`/api/admin/players/categories?tournamentId=${selectedTournament}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      
      // Process the categories to ensure base_points is a number
      const processedCategories = (data.categories || []).map((category: any) => ({
        ...category,
        base_points: category.base_points === null || category.base_points === undefined ? 0 : Number(category.base_points),
        min_points: category.min_points === null || category.min_points === undefined ? 0 : Number(category.min_points),
        max_points: category.max_points === null ? null : Number(category.max_points),
      }));
      
      // Check if any categories have base_points = 0
      const zeroBasePointsCategories = processedCategories.filter(
        (cat: any) => cat.base_points === 0
      );
      
      // Set categories with processed values
      setCategories(processedCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingCategories(false);
      setIsRefreshing(false);
    }
  }, [selectedTournament]);

  const fetchPlayers = useCallback(async () => {
    if (!selectedTournament) return;
    
    try {
      setLoadingPlayers(true);
      setError(null);
      
      const response = await fetch(`/api/players?tournamentId=${selectedTournament}`);
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch players';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingPlayers(false);
    }
  }, [selectedTournament]);

  const handleCreateCategory = async () => {
    if (!currentCategory || !selectedTournament) return;
    
    // Ensure base_points has a reasonable default value (1 Cr = 10,000,000)
    const categoryToCreate = {
      ...currentCategory,
      base_points: currentCategory.base_points || 10000000, // Default to 1 Cr if not provided
      min_points: currentCategory.min_points || 0,
      max_points: currentCategory.max_points || null
    };
    
    try {
      const response = await fetch('/api/admin/players/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...categoryToCreate,
          tournament_id: selectedTournament,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      toast.success('Category created successfully');
      setOpenCategoryDialog(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      toast.error(errorMessage);
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory || !currentCategory.id) return;
    
    // Ensure base_points and min_points are not null or zero
    const updatedCategory = {
      ...currentCategory,
      base_points: currentCategory.base_points || 10000000, // Default to 1 Cr if not provided
      min_points: currentCategory.min_points || 0,
      max_points: currentCategory.max_points || null
    };
    
    try {
      const response = await fetch(`/api/admin/players/categories/${currentCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      toast.success('Category updated successfully');
      setOpenCategoryDialog(false);
      setCurrentCategory(null);
      setIsEditing(false);
      fetchCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/admin/players/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const handleBulkUpdatePlayers = async () => {
    if (!selectedCategoryForBulk || selectedPlayers.length === 0) return;
    
    try {
      setIsBulkUpdating(true);
      
      const response = await fetch('/api/admin/players/update-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players: selectedPlayers,
          categoryId: selectedCategoryForBulk,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update players');
      }
      
      const result = await response.json();
      toast.success(result.message || 'Players updated successfully');
      setOpenBulkUpdateDialog(false);
      setSelectedCategoryForBulk('');
      fetchPlayers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update players';
      toast.error(errorMessage);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleEditCategory = (category: PlayerCategory) => {
    // Ensure min_points and base_points are not null
    const categoryWithDefaults = {
      ...category,
      min_points: category.min_points || 0,
      base_points: category.base_points || 0
    };
    setCurrentCategory(categoryWithDefaults);
    setIsEditing(true);
    setOpenCategoryDialog(true);
  };

  const handleAddCategory = () => {
    setCurrentCategory({
      name: '',
      category_type: 'LEVEL_1',
      base_points: 10000000, // Default to 1 Cr (Uncapped)
      min_points: 5000000,   // 0.5 Cr
      max_points: 20000000,  // 2 Cr
      description: '',
      skill_level: 'COMPETITIVE_A',
    });
    setIsEditing(false);
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setCurrentCategory(null);
    setIsEditing(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenBulkUpdateDialog = () => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select at least one player');
      return;
    }
    setOpenBulkUpdateDialog(true);
  };

  const categoryColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
    },
    {
      field: 'category_type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'LEVEL_1' ? 'primary' : 
            params.value === 'LEVEL_2' ? 'secondary' : 
            'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'base_points',
      headerName: 'Base Points',
      width: 120,
      type: 'number',
    },
    {
      field: 'min_points',
      headerName: 'Min Points',
      width: 120,
      type: 'number',
    },
    {
      field: 'max_points',
      headerName: 'Max Points',
      width: 120,
      type: 'number',
    },
    {
      field: 'skill_level',
      headerName: 'Skill Level',
      width: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<PlayerCategory>) => {
        if (!params || !params.row) return null;
        
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit Category">
              <IconButton
                size="small"
                onClick={() => {
                  handleEditCategory({
                    id: params.row.id,
                    tournament_id: params.row.tournament_id,
                    name: params.row.name,
                    category_type: params.row.category_type,
                    base_points: params.row.base_points,
                    min_points: params.row.min_points,
                    max_points: params.row.max_points,
                    description: params.row.description,
                    skill_level: params.row.skill_level,
                    created_at: params.row.created_at,
                    updated_at: params.row.updated_at
                  });
                }}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Category">
              <IconButton
                size="small"
                onClick={() => {
                  handleDeleteCategory(params.row.id);
                }}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  const playerColumns: GridColDef<Player>[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
    },
    {
      field: 'player_position',
      headerName: 'Position',
      width: 120,
    },
    {
      field: 'skill_level',
      headerName: 'Skill Level',
      width: 150,
    },
    {
      field: 'base_price',
      headerName: 'Base Price',
      width: 120,
      type: 'number',
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 200,
      valueGetter: (params: GridRenderCellParams<Player>) => {
        if (!params || !params.row) return 'None';
        
        // First check if we have a category object
        if (params.row.category) {
          return params.row.category.name || 'None';
        }
        
        // If no category object but we have category_id, find the category by ID
        if (params.row.category_id) {
          const category = categories.find(c => c.id === params.row.category_id);
          return category ? category.name : 'None';
        }
        
        return 'None';
      },
      renderCell: (params: GridRenderCellParams<Player>) => {
        if (!params || !params.row) return <Chip label="None" size="small" />;
        
        // First check if we have a category object
        let category = params.row.category;
        
        // If no category object but we have category_id, find the category by ID
        if (!category && params.row.category_id) {
          category = categories.find(c => c.id === params.row.category_id) || null;
        }
        
        return category ? (
          <Chip 
            label={category.name} 
            color={
              category.category_type === 'LEVEL_1' ? 'primary' : 
              category.category_type === 'LEVEL_2' ? 'secondary' : 
              'default'
            }
            size="small"
          />
        ) : (
          <Chip label="None" size="small" />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
    },
  ];

  if (isLoadingTournaments) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Player Categories Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage player categories and update player base points
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="tournament-select-label">Tournament</InputLabel>
            <Select
              labelId="tournament-select-label"
              value={selectedTournament}
              label="Tournament"
              onChange={(e) => setSelectedTournament(e.target.value)}
            >
              {tournaments.map((tournament) => (
                <MenuItem 
                  key={tournament.id} 
                  value={tournament.id}
                  sx={tournament.id === currentTournament?.id ? { fontWeight: 'bold' } : {}}
                >
                  {tournament.name}
                  {tournament.id === currentTournament?.id && ' (Current)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="player management tabs">
            <Tab label="Categories" id="tab-0" />
            <Tab label="Players" id="tab-1" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={() => fetchCategories()}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCategory}
              >
                Add Category
              </Button>
            </Box>
            
            <DataGridPro
              rows={categories}
              columns={categoryColumns}
              loading={loadingCategories}
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: false },
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: theme.palette.divider,
                },
              }}
              getRowId={(row) => row.id}
              autoHeight
            />
          </>
        )}

        {tabValue === 1 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Category Distribution
                  </Typography>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      Total Players: <strong>{players.length}</strong>
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel id="sort-categories-label">Sort By</InputLabel>
                      <Select
                        labelId="sort-categories-label"
                        value={categorySortOrder}
                        label="Sort By"
                        onChange={(e) => setCategorySortOrder(e.target.value as 'count' | 'name')}
                      >
                        <MenuItem value="count">Player Count</MenuItem>
                        <MenuItem value="name">Category Name</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {categories
                      .slice()
                      .sort((a, b) => {
                        if (categorySortOrder === 'name') {
                          return a.name.localeCompare(b.name);
                        } else {
                          // Sort by count
                          const countA = players.filter(
                            player => 
                              player.category_id === a.id || 
                              (player.category && player.category.id === a.id)
                          ).length;
                          const countB = players.filter(
                            player => 
                              player.category_id === b.id || 
                              (player.category && player.category.id === b.id)
                          ).length;
                          return countB - countA; // Descending order
                        }
                      })
                      .map((category) => {
                        // Count players in this category
                        const playersInCategory = players.filter(
                          player => 
                            player.category_id === category.id || 
                            (player.category && player.category.id === category.id)
                        ).length;
                        
                        // Calculate percentage
                        const percentage = players.length > 0 
                          ? Math.round((playersInCategory / players.length) * 100) 
                          : 0;
                        
                        return (
                          <Grid item xs={12} sm={6} md={3} key={category.id}>
                            <Box 
                              sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                              }}
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
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {playersInCategory}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Players ({percentage}%)
                              </Typography>
                              <Box sx={{ width: '100%', mt: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  color={
                                    category.category_type === 'LEVEL_1' ? 'primary' : 
                                    category.category_type === 'LEVEL_2' ? 'secondary' : 
                                    'info'
                                  }
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                      
                      {/* Add a card for players with no category */}
                      {(() => {
                        const playersWithNoCategory = players.filter(
                          player => !player.category_id && (!player.category || !player.category.id)
                        ).length;
                        
                        // Calculate percentage
                        const percentage = players.length > 0 
                          ? Math.round((playersWithNoCategory / players.length) * 100) 
                          : 0;
                        
                        return (
                          <Grid item xs={12} sm={6} md={3}>
                            <Box 
                              sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                              }}
                            >
                              <Chip 
                                label="No Category"
                                color="default"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {playersWithNoCategory}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Players ({percentage}%)
                              </Typography>
                              <Box sx={{ width: '100%', mt: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  color="warning"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })()}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<CategoryIcon />}
                onClick={handleOpenBulkUpdateDialog}
                disabled={selectedPlayers.length === 0}
              >
                Update Selected Players
              </Button>
            </Box>
            <DataGridPro
              rows={players}
              columns={playerColumns}
              loading={loadingPlayers}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => {
                setSelectedPlayers(newSelection);
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  printOptions: { disableToolbarButton: true },
                  csvOptions: { disableToolbarButton: false },
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: theme.palette.divider,
                },
              }}
              getRowId={(row) => row.id}
              autoHeight
            />
          </>
        )}
      </Paper>

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={currentCategory?.name || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category Type</InputLabel>
                <Select
                  value={currentCategory?.category_type || 'LEVEL_1'}
                  label="Category Type"
                  onChange={(e) => setCurrentCategory({ ...currentCategory, category_type: e.target.value })}
                >
                  <MenuItem value="LEVEL_1">LEVEL 1</MenuItem>
                  <MenuItem value="LEVEL_2">LEVEL 2</MenuItem>
                  <MenuItem value="LEVEL_3">LEVEL 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Skill Level</InputLabel>
                <Select
                  value={currentCategory?.skill_level || 'COMPETITIVE_A'}
                  label="Skill Level"
                  onChange={(e) => setCurrentCategory({ ...currentCategory, skill_level: e.target.value })}
                >
                  <MenuItem value="RECREATIONAL_C">RECREATIONAL C</MenuItem>
                  <MenuItem value="INTERMEDIATE_B">INTERMEDIATE B</MenuItem>
                  <MenuItem value="UPPER_INTERMEDIATE_BB">UPPER INTERMEDIATE BB</MenuItem>
                  <MenuItem value="COMPETITIVE_A">COMPETITIVE A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Base Points"
                type="number"
                fullWidth
                value={currentCategory?.base_points || 10000000}
                onChange={(e) => setCurrentCategory({ ...currentCategory, base_points: Number(e.target.value) })}
                helperText="Value in points (1 Cr = 10,000,000 points)"
                InputProps={{
                  endAdornment: (
                    <FormControl variant="standard" sx={{ minWidth: 80 }}>
                      <Select
                        value=""
                        displayEmpty
                        onChange={(e) => {
                          if (e.target.value) {
                            setCurrentCategory({ 
                              ...currentCategory, 
                              base_points: Number(e.target.value) 
                            });
                          }
                        }}
                        sx={{ border: 'none' }}
                      >
                        <MenuItem value="" disabled>
                          <em>Presets</em>
                        </MenuItem>
                        <MenuItem value={10000000}>1 Cr</MenuItem>
                        <MenuItem value={30000000}>3 Cr</MenuItem>
                        <MenuItem value={50000000}>5 Cr</MenuItem>
                      </Select>
                    </FormControl>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Min Points"
                type="number"
                fullWidth
                value={currentCategory?.min_points || 0}
                onChange={(e) => setCurrentCategory({ ...currentCategory, min_points: parseInt(e.target.value) })}
                helperText="Minimum bid value in points"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Max Points"
                type="number"
                fullWidth
                value={currentCategory?.max_points || 0}
                onChange={(e) => setCurrentCategory({ ...currentCategory, max_points: parseInt(e.target.value) })}
                helperText="Maximum bid value in points"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={currentCategory?.description || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button 
            onClick={isEditing ? handleUpdateCategory : handleCreateCategory} 
            variant="contained"
            startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={openBulkUpdateDialog} onClose={() => setOpenBulkUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Players Category</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              You are about to update {selectedPlayers.length} players. This will update their category and base price.
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Category</InputLabel>
              <Select
                value={selectedCategoryForBulk}
                label="Select Category"
                onChange={(e) => setSelectedCategoryForBulk(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} - {category.base_points} points
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkUpdateDialog(false)} disabled={isBulkUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpdatePlayers} 
            variant="contained"
            disabled={!selectedCategoryForBulk || isBulkUpdating}
            startIcon={isBulkUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isBulkUpdating ? 'Updating...' : 'Update Players'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 