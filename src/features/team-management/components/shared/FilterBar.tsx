import {
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Paper,
    IconButton,
    InputAdornment
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import SearchIcon from '@mui/icons-material/Search';
import type { FilterState } from '../../types/filter';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS, INITIAL_FILTER_STATE } from '../../constants/index';
import type { PositionConfig, SkillLevelConfig } from '../../constants/index';
import React from 'react';

interface FilterBarProps {
    filterState?: FilterState;
    onFilterChange: (newState: FilterState) => void;
    onClearFilters: () => void;
    title?: string;
    showCategoryFilter?: boolean;
}

export function FilterBar({
    filterState = INITIAL_FILTER_STATE,
    onFilterChange,
    onClearFilters,
    title = 'Filter Players',
    showCategoryFilter = false
}: FilterBarProps) {
    const handleFilterChange = (field: keyof FilterState, value: string | number) => {
        onFilterChange({
            ...filterState,
            [field]: value
        });
    };

    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: 3,
                borderRadius: 2,
                background: theme => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {title && (
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ManageSearchIcon color="primary" />
                                {title}
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={onClearFilters}
                            >
                                Clear All Filters
                            </Button>
                        </Box>
                    )}
                    {!title && (
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Button
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={onClearFilters}
                            >
                                Clear All Filters
                            </Button>
                        </Box>
                    )}
                </Grid>
                {showCategoryFilter && (
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filterState.category}
                                label="Category"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                {CATEGORY_LABELS.map((cat) => (
                                    <MenuItem 
                                        key={cat.value} 
                                        value={cat.value}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Box component="span" sx={{ color: cat.color }}>
                                            {React.createElement(cat.icon)}
                                        </Box>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Position</InputLabel>
                        <Select
                            value={filterState.position}
                            label="Position"
                            onChange={(e) => handleFilterChange('position', e.target.value)}
                        >
                            <MenuItem value="">All Positions</MenuItem>
                            {POSITIONS.map((pos: PositionConfig) => (
                                <MenuItem 
                                    key={pos.value} 
                                    value={pos.value}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <Box component="span" sx={{ color: pos.color }}>
                                        {React.createElement(pos.icon)}
                                    </Box>
                                    {pos.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Skill Level</InputLabel>
                        <Select
                            value={filterState.skillLevel}
                            label="Skill Level"
                            onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                        >
                            <MenuItem value="">All Skill Levels</MenuItem>
                            {SKILL_LEVELS.map((skill: SkillLevelConfig) => (
                                <MenuItem 
                                    key={skill.value} 
                                    value={skill.value}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <Box component="span" sx={{ color: skill.color }}>
                                        {React.createElement(skill.icon)}
                                    </Box>
                                    {skill.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search Players"
                        value={filterState.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: filterState.searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleFilterChange('searchQuery', '')}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
} 