'use client'

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Stack,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material'
import {
  PeopleAlt as PeopleIcon,
  SportsVolleyball as VolleyballIcon,
  SportsHandball as ThrowballIcon,
  ChildCare as YouthIcon,
  School as TeenIcon,
  Straighten as SizeIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  CurrencyRupee as RupeeIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material'
import { useEffect, useState, useCallback } from 'react'
import { TournamentRegistration, TShirtSize } from '@/features/tournaments/types/registration'
import { RegistrationSummary, CategoryDistribution, JerseySize } from '../types/dashboard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts'

const COLORS = ['#0ea5e9', '#f97316', '#10b981', '#ef4444', '#9c27b0']

// Category display names mapping
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'VOLLEYBALL_OPEN_MEN': 'Volleyball - Open',
  'THROWBALL_WOMEN': 'Throwball - Women',
  'THROWBALL_13_17_MIXED': 'Throwball - 13-17 Mixed',
  'THROWBALL_8_12_MIXED': 'Throwball - 8-12 Mixed',
}

// T-shirt size display names
const TSHIRT_SIZE_DISPLAY: Record<string, string> = {
  'XS': 'XS (34")',
  'S': 'S (36")',
  'M': 'M (38")',
  'L': 'L (40")',
  'XL': 'XL (42")',
  '2XL': '2XL (44")',
  '3XL': '3XL (46")',
}

// Payment receiver display names
const PAYMENT_RECEIVER_DISPLAY: Record<string, string> = {
  'Vasu Chepuru': 'Vasu',
  'Amit Saxena': 'Amit',
}

interface CategoryCount {
  category: string;
  count: number;
}

// Dark Recharts tooltip styles
const darkTooltipStyle = {
  backgroundColor: '#1a2234',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: '#ffffff',
}
const darkTooltipLabelStyle = { color: '#ffffff' }
const darkTooltipItemStyle = { color: '#94a3b8' }

export function RegistrationDashboard() {
  const [summary, setSummary] = useState<RegistrationSummary>({
    totalRegistrations: 0,
    volleyballCount: 0,
    throwballCount: 0,
    youth8To12Count: 0,
    youth13To17Count: 0,
    categoryDistribution: [],
    jerseySizes: [],
    recentRegistrations: [],
    timelineData: [],
    paymentCollections: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({
    category: false,
    jersey: false,
    timeline: false,
    payment: false
  })

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/registrations/summary')
      if (!response.ok) {
        throw new Error('Failed to fetch registration summary')
      }
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setLastUpdate(new Date())
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const toggleChart = (chartId: string) => {
    setExpandedCharts(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }))
  }

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

  // Prepare data for charts
  const categoryChartData = summary.categoryDistribution.map((category: CategoryDistribution) => ({
    name: CATEGORY_DISPLAY_NAMES[category.name] || category.name,
    value: category.count,
    color: COLORS[summary.categoryDistribution.indexOf(category) % COLORS.length]
  }))

  const jerseyChartData = summary.jerseySizes.map((size) => ({
    name: TSHIRT_SIZE_DISPLAY[size.size as TShirtSize] || size.size,
    value: size.count,
    color: COLORS[summary.jerseySizes.indexOf(size) % COLORS.length]
  }))

  // Prepare timeline data
  const timelineData = summary.timelineData.reduce((acc: Record<string, any>[], registration: { created_at: string; registration_category: string }) => {
    const date = new Date(registration.created_at).toLocaleDateString()
    const existingDate = acc.find(item => item.date === date)
    const categoryName = CATEGORY_DISPLAY_NAMES[registration.registration_category]

    if (existingDate) {
      existingDate[categoryName] = (existingDate[categoryName] || 0) + 1
      existingDate.total = (existingDate.total || 0) + 1
    } else {
      const newDate = {
        date,
        [categoryName]: 1,
        total: 1
      }
      acc.push(newDate)
    }

    return acc
  }, []).sort((a: Record<string, any>, b: Record<string, any>) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Get unique categories for timeline chart
  const uniqueCategories = Object.values(CATEGORY_DISPLAY_NAMES)

  // Calculate insights
  const totalParticipants = summary.totalRegistrations
  const youthPercentage = ((summary.youth8To12Count + summary.youth13To17Count) / totalParticipants * 100).toFixed(1)
  const mostPopularCategory = {
    ...summary.categoryDistribution.reduce((prev, current) =>
      (current.count > prev.count) ? current : prev
    ),
    name: CATEGORY_DISPLAY_NAMES[summary.categoryDistribution.reduce((prev, current) =>
      (current.count > prev.count) ? current : prev
    ).name]
  }
  const mostPopularSize = {
    ...summary.jerseySizes.reduce((prev, current) =>
      (current.count > prev.count) ? current : prev
    ),
    size: TSHIRT_SIZE_DISPLAY[summary.jerseySizes.reduce((prev, current) =>
      (current.count > prev.count) ? current : prev
    ).size]
  }

  // Prepare payment data
  const paymentChartData = summary.paymentCollections.map((collection: { receiver: string; totalAmount: number; verifiedAmount: number }, index: number) => ({
    name: PAYMENT_RECEIVER_DISPLAY[collection.receiver] || collection.receiver,
    verified: collection.verifiedAmount,
    pending: collection.totalAmount - collection.verifiedAmount,
    total: collection.totalAmount,
    color: COLORS[index % COLORS.length],
  }))

  // Calculate total collections
  const totalCollections = paymentChartData.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
  const totalVerified = paymentChartData.reduce((sum: number, item: { verified: number }) => sum + item.verified, 0)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const ChartContainer = ({
    id,
    title,
    children
  }: {
    id: string,
    title: string,
    children: React.ReactNode
  }) => {
    const isExpanded = expandedCharts[id]

    return (
      <>
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer' }}
            onClick={() => toggleChart(id)}
          >
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Tooltip title={isExpanded ? "Exit Full Screen" : "Full Screen"}>
              <IconButton size="small">
                {isExpanded ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              height: '400px',
              overflow: 'hidden',
            }}
          >
            {children}
          </Box>
        </Paper>

        <Modal
          open={isExpanded}
          onClose={() => toggleChart(id)}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={isExpanded}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90vw',
                height: '90vh',
                bgcolor: '#1a2234',
                boxShadow: 24,
                p: 4,
                borderRadius: 1,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="h6">
                  {title}
                </Typography>
                <Tooltip title="Exit Full Screen">
                  <IconButton onClick={() => toggleChart(id)} size="small">
                    <FullscreenExitIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ height: 'calc(100% - 48px)' }}>
                {children}
              </Box>
            </Box>
          </Fade>
        </Modal>
      </>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <Paper sx={{
          p: 2,
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(249, 115, 22, 0.08) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon sx={{ color: '#0ea5e9' }} />
                  <Typography variant="h6">Quick Insights</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </Typography>
                  <Tooltip title="Refresh Data">
                    <IconButton
                      onClick={fetchSummary}
                      disabled={loading}
                      sx={{ color: '#94a3b8' }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>
                  Registration Status
                </Typography>
                <Typography variant="body2">
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: '#0ea5e9',
                      mr: 0.5,
                    }}
                  >
                    {totalParticipants}
                  </Typography>
                  total registrations across {Object.keys(CATEGORY_DISPLAY_NAMES).length} categories
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Most popular: {mostPopularCategory.name} ({mostPopularCategory.count} players)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>
                  Youth Participation
                </Typography>
                <Typography variant="body2">
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: '#f97316',
                      mr: 0.5,
                    }}
                  >
                    {summary.youth8To12Count + summary.youth13To17Count}
                  </Typography>
                  youth players
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {youthPercentage}% of total registrations
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>
                  Payment Overview
                </Typography>
                <Typography variant="body2">
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: '#10b981',
                      mr: 0.5,
                    }}
                  >
                    {formatCurrency(totalCollections)}
                  </Typography>
                  total collections
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {((totalVerified / totalCollections) * 100).toFixed(1)}% payments verified
                  ({formatCurrency(totalVerified)})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  <strong>Key Trends:</strong>
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip
                    size="small"
                    label={`Most common size: ${mostPopularSize.size}`}
                    sx={{
                      bgcolor: 'rgba(14, 165, 233, 0.15)',
                      color: '#38bdf8',
                      '& .MuiChip-label': { fontSize: '0.75rem' }
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${summary.throwballCount} Throwball players`}
                    sx={{
                      bgcolor: 'rgba(249, 115, 22, 0.15)',
                      color: '#fb923c',
                      '& .MuiChip-label': { fontSize: '0.75rem' }
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${summary.volleyballCount} Volleyball players`}
                    sx={{
                      bgcolor: 'rgba(14, 165, 233, 0.15)',
                      color: '#38bdf8',
                      '& .MuiChip-label': { fontSize: '0.75rem' }
                    }}
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Key Summary */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Quick Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon sx={{ color: '#0ea5e9' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Registrations</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {totalParticipants}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <RupeeIcon sx={{ color: '#10b981' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Collections</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {formatCurrency(totalCollections)}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({formatCurrency(totalVerified)} verified)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Category Distribution Chart */}
        <Grid item xs={12} md={6}>
          <ChartContainer id="category" title="Category Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ x, y, value, percent }) => (
                    <text x={x} y={y} fill="#94a3b8" textAnchor="middle" dominantBaseline="central" fontSize={12}>
                      {`${value} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  )}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={darkTooltipStyle}
                  labelStyle={darkTooltipLabelStyle}
                  itemStyle={darkTooltipItemStyle}
                  formatter={(value, name) => [`${value} registrations`, name]}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Jersey Size Distribution Chart */}
        <Grid item xs={12} md={6}>
          <ChartContainer id="jersey" title="Jersey Size Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jerseyChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={darkTooltipStyle}
                  labelStyle={darkTooltipLabelStyle}
                  itemStyle={darkTooltipItemStyle}
                  formatter={(value) => [`${value} requests`]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" name="Count" fill="#8884d8">
                  {jerseyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#94a3b8" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Registration Timeline Chart */}
        <Grid item xs={12}>
          <ChartContainer id="timeline" title="Registration Timeline">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timelineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={darkTooltipStyle}
                  labelStyle={darkTooltipLabelStyle}
                  itemStyle={darkTooltipItemStyle}
                  formatter={(value, name) => [`${value} registrations`, name]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ color: '#94a3b8' }}
                />
                {uniqueCategories.map((category: string, index: number) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="registrations"
                    fill={COLORS[index % COLORS.length]}
                    name={category}
                  >
                    <LabelList
                      dataKey={category}
                      position="center"
                      fill="#fff"
                      formatter={(value: number) => (value > 0 ? value : '')}
                      style={{ fontSize: '11px' }}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>

        {/* Payment Collections Chart */}
        <Grid item xs={12}>
          <ChartContainer
            id="payment"
            title={`Payment Collections by Receiver (${formatCurrency(totalCollections)} total)`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barSize={60}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{
                    value: 'Amount (₹)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -5,
                    fill: '#94a3b8',
                  }}
                />
                <RechartsTooltip
                  contentStyle={darkTooltipStyle}
                  labelStyle={darkTooltipLabelStyle}
                  itemStyle={darkTooltipItemStyle}
                  formatter={(value, name) => {
                    const formattedValue = formatCurrency(value as number)
                    if (name === 'verified') return [`${formattedValue} verified`, 'Verified']
                    if (name === 'pending') return [`${formattedValue} pending`, 'Pending']
                    return [formattedValue, name]
                  }}
                  labelFormatter={(label) => `Receiver: ${label}`}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ color: '#94a3b8' }}
                />
                <Bar
                  dataKey="verified"
                  name="Verified"
                  stackId="a"
                  fill="#10b981"
                  minPointSize={5}
                >
                  <LabelList
                    dataKey="verified"
                    position="center"
                    fill="#fff"
                    formatter={(value: number) => (value > 0 ? `₹${value}` : '')}
                    style={{ fontSize: '11px' }}
                  />
                </Bar>
                <Bar
                  dataKey="pending"
                  name="Pending"
                  stackId="a"
                  fill="#f97316"
                  minPointSize={5}
                >
                  <LabelList
                    dataKey="pending"
                    position="center"
                    fill="#fff"
                    formatter={(value: number) => (value > 0 ? `₹${value}` : '')}
                    style={{ fontSize: '11px' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  )
}
