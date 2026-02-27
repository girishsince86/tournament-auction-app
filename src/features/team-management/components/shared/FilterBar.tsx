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
    InputAdornment,
    Chip,
    Checkbox,
    ListItemText,
    SelectChangeEvent
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
    const handleMultiSelectChange = (field: 'position' | 'skillLevel' | 'category') => (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        onFilterChange({
            ...filterState,
            [field]: typeof value === 'string' ? value.split(',') : value
        });
    };

    const handleSearchChange = (value: string) => {
        onFilterChange({
            ...filterState,
            searchQuery: value
        });
    };

    const getLabelForCategory = (val: string) =>
        CATEGORY_LABELS.find(c => c.value === val)?.label || val;

    const getLabelForPosition = (val: string) =>
        POSITIONS.find(p => p.value === val)?.label || val;

    const getLabelForSkill = (val: string) =>
        SKILL_LEVELS.find(s => s.value === val)?.label || val;

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
                                multiple
                                value={filterState.category}
                                label="Category"
                                onChange={handleMultiSelectChange('category')}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((val) => (
                                            <Chip key={val} label={getLabelForCategory(val)} size="small" />
                                        ))}
                                    </Box>
                                )}
                            >
                                {CATEGORY_LABELS.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        <Checkbox checked={filterState.category.includes(cat.value)} size="small" />
                                        <Box component="span" sx={{ color: cat.color, mr: 1, display: 'flex' }}>
                                            {React.createElement(cat.icon, { fontSize: 'small' })}
                                        </Box>
                                        <ListItemText primary={cat.label} />
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
                            multiple
                            value={filterState.position}
                            label="Position"
                            onChange={handleMultiSelectChange('position')}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((val) => (
                                        <Chip key={val} label={getLabelForPosition(val)} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {POSITIONS.map((pos: PositionConfig) => (
                                <MenuItem key={pos.value} value={pos.value}>
                                    <Checkbox checked={filterState.position.includes(pos.value)} size="small" />
                                    <Box component="span" sx={{ color: pos.color, mr: 1, display: 'flex' }}>
                                        {React.createElement(pos.icon, { fontSize: 'small' })}
                                    </Box>
                                    <ListItemText primary={pos.label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Skill Level</InputLabel>
                        <Select
                            multiple
                            value={filterState.skillLevel}
                            label="Skill Level"
                            onChange={handleMultiSelectChange('skillLevel')}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((val) => (
                                        <Chip key={val} label={getLabelForSkill(val)} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {SKILL_LEVELS.map((skill: SkillLevelConfig) => (
                                <MenuItem key={skill.value} value={skill.value}>
                                    <Checkbox checked={filterState.skillLevel.includes(skill.value)} size="small" />
                                    <Box component="span" sx={{ color: skill.color, mr: 1, display: 'flex' }}>
                                        {React.createElement(skill.icon, { fontSize: 'small' })}
                                    </Box>
                                    <ListItemText primary={skill.label} />
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
                        onChange={(e) => handleSearchChange(e.target.value)}
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
                                        onClick={() => handleSearchChange('')}
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
