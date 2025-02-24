import {
    Box,
    Paper,
    Typography,
    Grid,
    Alert,
    AlertTitle,
    Chip,
    Stack,
    LinearProgress
} from '@mui/material';
import type { SimulationState } from '../../hooks/useTeamSimulation';
import { POSITIONS, SKILL_LEVELS, CATEGORY_LABELS } from '../../constants';

interface SimulationSummaryProps {
    simulation: SimulationState;
    isPreAuction: boolean;
}

export function SimulationSummary({ simulation, isPreAuction }: SimulationSummaryProps) {
    const {
        initialBudget,
        remainingBudget,
        simulatedBudget,
        currentPlayers,
        maxPlayers,
        positionCounts,
        skillLevelCounts,
        categoryDistribution,
        budgetValid,
        positionRequirementsValid,
        skillRequirementsValid,
        categoryRequirementsValid,
        playerCountValid
    } = simulation;

    // Check if there are any position or skill requirements set
    const hasPositionRequirements = Object.values(positionCounts).some(count => count.required > 0);
    const hasSkillRequirements = Object.values(skillLevelCounts).some(count => count.required > 0);

    const budgetUtilization = ((initialBudget - remainingBudget + simulatedBudget) / initialBudget) * 100;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Team Simulation Summary
            </Typography>

            {/* Validation Alerts */}
            <Stack spacing={2} sx={{ mb: 3 }}>
                {!budgetValid && (
                    <Alert severity="error">
                        <AlertTitle>Budget Exceeded</AlertTitle>
                        Simulated preferences exceed available budget by 
                        ₹{(simulatedBudget - remainingBudget).toLocaleString()}
                    </Alert>
                )}
                {!playerCountValid && (
                    <Alert severity="error">
                        <AlertTitle>Player Limit Exceeded</AlertTitle>
                        Total players would exceed maximum team size of {maxPlayers}
                    </Alert>
                )}
                {!categoryRequirementsValid && (
                    <Alert severity="error">
                        <AlertTitle>Category Requirements Not Met</AlertTitle>
                        Some category requirements are not satisfied with current preferences
                    </Alert>
                )}
                {hasPositionRequirements && !positionRequirementsValid && (
                    <Alert severity="warning">
                        <AlertTitle>Position Requirements Not Met</AlertTitle>
                        Some position requirements are not satisfied with current preferences
                    </Alert>
                )}
                {hasSkillRequirements && !skillRequirementsValid && (
                    <Alert severity="warning">
                        <AlertTitle>Skill Level Requirements Not Met</AlertTitle>
                        Some skill level requirements are not satisfied with current preferences
                    </Alert>
                )}
            </Stack>

            {/* Budget Overview */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Budget Utilization
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={budgetUtilization}
                    color={budgetUtilization > 100 ? "error" : "primary"}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                />
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                            Initial Budget
                        </Typography>
                        <Typography variant="h6">
                            ₹{initialBudget.toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                            Simulated Spend
                        </Typography>
                        <Typography variant="h6" color={budgetValid ? "success.main" : "error.main"}>
                            ₹{simulatedBudget.toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                            Remaining After Simulation
                        </Typography>
                        <Typography variant="h6" color={budgetValid ? "inherit" : "error.main"}>
                            ₹{(remainingBudget - simulatedBudget).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Position Requirements - Only show if requirements exist */}
            {hasPositionRequirements && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Position Distribution
                    </Typography>
                    <Grid container spacing={2}>
                        {POSITIONS.map(pos => {
                            const counts = positionCounts[pos.value];
                            if (!counts || counts.required === 0) return null;
                            
                            const total = counts.current + counts.simulated;
                            const required = counts.required;
                            const isValid = total >= required;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={pos.value}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <Typography variant="subtitle2">{pos.label}</Typography>
                                            <Chip 
                                                size="small"
                                                label={`${total}/${required} required`}
                                                color={isValid ? "success" : "error"}
                                            />
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <Chip 
                                                size="small" 
                                                label={`Current: ${counts.current}`}
                                            />
                                            <Chip 
                                                size="small"
                                                label={`Simulated: +${counts.simulated}`}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {/* Skill Level Requirements - Only show if requirements exist */}
            {hasSkillRequirements && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Skill Level Distribution
                    </Typography>
                    <Grid container spacing={2}>
                        {SKILL_LEVELS.map(skill => {
                            const counts = skillLevelCounts[skill.value];
                            if (!counts || counts.required === 0) return null;
                            
                            const total = counts.current + counts.simulated;
                            const required = counts.required;
                            const isValid = total >= required;

                            return (
                                <Grid item xs={12} sm={6} md={3} key={skill.value}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <Typography variant="subtitle2">{skill.label}</Typography>
                                            <Chip 
                                                size="small"
                                                label={`${total}/${required} required`}
                                                color={isValid ? "success" : "error"}
                                            />
                                        </Stack>
                                        <Stack direction="row" spacing={1}>
                                            <Chip 
                                                size="small" 
                                                label={`Current: ${counts.current}`}
                                            />
                                            <Chip 
                                                size="small"
                                                label={`Simulated: +${counts.simulated}`}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            )}

            {/* Category Distribution - Always show */}
            <Box>
                <Typography variant="subtitle1" gutterBottom>
                    Category Distribution
                </Typography>
                <Grid container spacing={2}>
                    {CATEGORY_LABELS.map(category => {
                        const counts = categoryDistribution[category.value];
                        const total = counts.current + counts.simulated;
                        const isValid = total >= counts.required;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={category.value}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <Typography variant="subtitle2">{category.label}</Typography>
                                        <Chip 
                                            size="small"
                                            label={`${total}${counts.required > 0 ? `/${counts.required} required` : ' total'}`}
                                            color={isValid ? "success" : "error"}
                                            sx={{ bgcolor: category.color }}
                                        />
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Chip 
                                            size="small" 
                                            label={`Current: ${counts.current}`}
                                        />
                                        <Chip 
                                            size="small"
                                            label={`Simulated: +${counts.simulated}`}
                                            variant="outlined"
                                        />
                                    </Stack>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Paper>
    );
} 