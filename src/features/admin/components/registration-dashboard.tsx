'use client'

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  PeopleAlt as PeopleIcon,
  SportsVolleyball as VolleyballIcon,
  SportsHandball as ThrowballIcon,
  ChildCare as YouthIcon,
  School as TeenIcon,
  Straighten as SizeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useEffect, useState, useCallback } from 'react'
import { RegistrationSummary } from '../types/dashboard'

export function RegistrationDashboard() {
  const [summary, setSummary] = useState<RegistrationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/registrations/summary')
      if (!response.ok) {
        throw new Error('Failed to fetch registration summary')
      }
      const data = await response.json()
      console.log('Dashboard data:', data)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!summary) {
    return null
  }

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string
    value: number | string
    icon: React.ElementType
    color: string
  }) => {
    console.log(`StatCard ${title}:`, value)
    return (
      <Card sx={{ height: '100%', minWidth: '200px' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Icon sx={{ color, fontSize: 32, mr: 1 }} />
            <Typography variant="h6" color="text.secondary" noWrap>
              {title}
            </Typography>
          </Box>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              mt: 1
            }}
          >
            {typeof value === 'number' ? value : value || 0}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Registration Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={fetchSummary}
            disabled={loading}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="Total"
            value={summary.totalRegistrations}
            icon={PeopleIcon}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="Volleyball"
            value={summary.volleyballCount}
            icon={VolleyballIcon}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="Throwball"
            value={summary.throwballCount}
            icon={ThrowballIcon}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="Youth (8-12)"
            value={summary.youth8To12Count}
            icon={YouthIcon}
            color="#e91e63"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2.4}>
          <StatCard
            title="Youth (13-17)"
            value={summary.youth13To17Count}
            icon={TeenIcon}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Category Distribution */}
      <Typography variant="h6" gutterBottom>
        Registration by Category
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Registrations</TableCell>
              <TableCell align="right">Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.categoryDistribution.map((category) => (
              <TableRow key={category.name}>
                <TableCell component="th" scope="row">
                  {category.name}
                </TableCell>
                <TableCell align="right">{category.count}</TableCell>
                <TableCell align="right">
                  {((category.count / summary.totalRegistrations) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Jersey Sizes Distribution */}
      <Typography variant="h6" gutterBottom>
        Jersey Size Distribution
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Size</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="right">Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.jerseySizes.map((size) => (
              <TableRow key={size.size}>
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center">
                    <SizeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {size.size}
                  </Box>
                </TableCell>
                <TableCell align="right">{size.count}</TableCell>
                <TableCell align="right">
                  {((size.count / summary.totalRegistrations) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Recent Registrations */}
      <Typography variant="h6" gutterBottom>
        Recent Registrations
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Jersey Number</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.recentRegistrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>
                  {registration.first_name} {registration.last_name}
                </TableCell>
                <TableCell>{registration.registration_category}</TableCell>
                <TableCell>{registration.tshirt_number}</TableCell>
                <TableCell>
                  {new Date(registration.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={registration.is_verified ? 'Verified' : 'Pending'}
                    color={registration.is_verified ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
} 