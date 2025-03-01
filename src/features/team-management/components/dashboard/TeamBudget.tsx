import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Alert,
    AlertTitle,
    Grid,
    Chip,
    Stack,
    Paper,
    Skeleton,
    Divider,
    Tooltip
} from '@mui/material';
import { useState } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import type { TeamBudgetDetails, TeamBudgetMetrics } from '../../types/index';
import { formatPointsInCrores } from '@/lib/utils/format';

interface TeamBudgetProps {
    teamId: string;
    budget?: TeamBudgetDetails;
    metrics?: TeamBudgetMetrics;
    onBudgetUpdate?: () => void;
    isAdminView?: boolean;
    isLoading?: boolean;
}

const defaultBudget: TeamBudgetDetails = {
    initial_budget: 0,
    remaining_budget: 0,
    allocated_budget: 0,
    reserved_budget: 0,
    average_player_cost: 0,
    budget_utilization_percentage: 0
};

const defaultMetrics: TeamBudgetMetrics = {
    avg_player_cost: 0,
    total_players: 0,
    marquee_players: 0,
    capped_players: 0,
    uncapped_players: 0,
    total_cost: 0,
    remaining_budget: 0,
    budget_utilization: 0
};

export function TeamBudget({ 
    teamId, 
    budget = defaultBudget,
    metrics = defaultMetrics,
    onBudgetUpdate,
    isAdminView = false,
    isLoading = false
}: TeamBudgetProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Stack spacing={3}>
                        <Skeleton variant="text" width="60%" height={32} />
                        <Skeleton variant="rectangular" height={8} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Skeleton variant="rectangular" height={80} />
                                    <Skeleton variant="rectangular" height={80} />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Skeleton variant="rectangular" height={80} />
                                    <Skeleton variant="rectangular" height={80} />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const {
        initial_budget,
        remaining_budget,
        allocated_budget,
        reserved_budget,
        average_player_cost,
        budget_utilization_percentage
    } = budget;

    if (!initial_budget && !isLoading) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="warning">
                        <AlertTitle>Budget Not Available</AlertTitle>
                        The team budget information is not available at the moment.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Team Budget Overview
                </Typography>
                
                <Grid container spacing={3}>
                    {/* Budget Progress */}
                    <Grid item xs={12}>
                        <Box mb={2}>
                            <Typography variant="subtitle1">
                                Budget Utilization
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={typeof budget_utilization_percentage === 'number' ? budget_utilization_percentage : 0}
                                color={typeof budget_utilization_percentage === 'number' && budget_utilization_percentage > 90 ? "error" : "primary"}
                            />
                            <Typography variant="caption" color="textSecondary">
                                {typeof budget_utilization_percentage === 'number' ? budget_utilization_percentage.toFixed(1) : '0'}% Used
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Budget Stats */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2">Initial Budget</Typography>
                                <Typography variant="h6">
                                    {formatPointsInCrores(initial_budget)}
                                </Typography>
                            </Paper>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2">Remaining Budget</Typography>
                                <Typography variant="h6" color={remaining_budget < initial_budget * 0.1 ? "error" : "inherit"}>
                                    {formatPointsInCrores(remaining_budget)}
                                </Typography>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Metrics */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2">Average Player Cost</Typography>
                                <Typography variant="h6">
                                    {formatPointsInCrores(metrics.avg_player_cost || average_player_cost || 0)}
                                </Typography>
                            </Paper>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle2">Budget Utilization</Typography>
                                <Typography variant="h6">
                                    {metrics.budget_utilization.toFixed(2)}%
                                </Typography>
                                <Chip 
                                    icon={<AccountBalanceWalletIcon />}
                                    label="Budget Efficiency"
                                    color={metrics.budget_utilization > 80 ? "success" : metrics.budget_utilization > 60 ? "warning" : "error"}
                                    size="small"
                                />
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Player Breakdown */}
                    <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Player Breakdown
                            </Typography>
                            <Grid container spacing={2} mt={1}>
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PeopleIcon color="primary" />
                                        <Typography variant="body2">
                                            Total: <strong>{metrics.total_players}</strong>
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <StarIcon color="error" />
                                        <Typography variant="body2">
                                            Marquee: <strong>{metrics.marquee_players}</strong>
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <VerifiedIcon color="warning" />
                                        <Typography variant="body2">
                                            Capped: <strong>{metrics.capped_players}</strong>
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PersonIcon color="success" />
                                        <Typography variant="body2">
                                            Uncapped: <strong>{metrics.uncapped_players}</strong>
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Alerts */}
                    {remaining_budget < initial_budget * 0.1 && (
                        <Grid item xs={12}>
                            <Alert severity="warning">
                                <AlertTitle>Low Budget Warning</AlertTitle>
                                Your team is running low on budget. Consider strategic player selections.
                            </Alert>
                        </Grid>
                    )}
                    
                    {(reserved_budget ?? 0) > 0 && (
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <AlertTitle>Reserved Budget</AlertTitle>
                                {formatPointsInCrores(reserved_budget ?? 0)} are reserved for preferred player acquisitions.
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
} 