'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Paper,
  useTheme,
  Stack,
  Chip,
  Grid,
  Divider,
  Collapse,
} from '@mui/material'
import {
  DataGridPro,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
  GridFilterModel,
  GridSortModel,
  GridPaginationModel,
  LicenseInfo,
  GridValueGetter,
} from '@mui/x-data-grid-pro'
import {
  Visibility as ViewIcon,
  CheckCircle as VerifyIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  SportsVolleyball as VolleyballIcon,
  SportsHandball as ThrowballIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Groups as GroupsIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material'
import { useAuth } from '@/features/auth/context/auth-context'
import { RegistrationDetailModal } from './registration-detail-modal'
import { VerifyPaymentModal } from './verify-payment-modal'
import { TournamentRegistration } from '@/features/tournaments/types/registration'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

// Set MUI X License
if (process.env.NEXT_PUBLIC_MUI_X_KEY) {
  LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_X_KEY)
}

const REGISTRATION_AMOUNT = 600

const CATEGORY_MAP = {
  'VOLLEYBALL_OPEN_MEN': 'Volleyball - Open',
  'THROWBALL_WOMEN': 'Throwball - Women',
  'THROWBALL_13_17_MIXED': 'Throwball - 13-17 Mixed',
  'THROWBALL_8_12_MIXED': 'Throwball - 8-12 Mixed',
} as const;

interface CategoryCount {
  name: string;
  count: number;
}

interface RegistrationSummary {
  totalRegistrations: number;
  verifiedRegistrations: number;
  categoryDistribution: CategoryCount[];
  pendingVerification: number;
  ageDistribution?: Array<{ age: number; count: number }>;
}

const PAYMENT_RECEIVERS = {
  'Vasu Chepuru': 'Vasu',
  'Amit Saxena': 'Amit',
} as const;

export function ManageRegistrations() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<TournamentRegistration | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  })
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'created_at',
      sort: 'desc',
    },
  ])
  const [summary, setSummary] = useState<RegistrationSummary>({
    totalRegistrations: 0,
    verifiedRegistrations: 0,
    categoryDistribution: [],
    pendingVerification: 0,
  })
  const theme = useTheme();
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)

  // Check if user can verify payments
  const canVerifyPayments = user?.email?.match(/@pbel\.in$/) && 
    ['amit@pbel.in', 'vasu@pbel.in'].includes(user.email)

  // Get verifier name based on email
  const getVerifierName = (email: string) => {
    if (email === 'vasu@pbel.in') return 'Vasu Chepuru'
    if (email === 'amit@pbel.in') return 'Amit Saxena'
    return ''
  }

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.set('page', String(paginationModel.page + 1))
      params.set('pageSize', String(paginationModel.pageSize))

      // Add sorting
      if (sortModel.length > 0) {
        params.set('sortField', sortModel[0].field)
        params.set('sortDirection', sortModel[0].sort || 'desc')
      }

      // Add filters
      filterModel.items.forEach(filter => {
        if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
          params.append(`filter_${filter.field}`, String(filter.value))
        }
      })

      const response = await fetch(`/api/admin/registrations?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch registrations')
      }

      const data = await response.json()
      if (!data.registrations || !Array.isArray(data.registrations)) {
        throw new Error('Invalid response format')
      }

      setRegistrations(data.registrations)
      setTotalRows(data.total || 0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch registrations'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [paginationModel.page, paginationModel.pageSize, sortModel, filterModel.items])

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/registrations/summary')
      if (!response.ok) {
        throw new Error('Failed to fetch summary')
      }
      const data = await response.json()
      setSummary({
        totalRegistrations: data.totalRegistrations,
        verifiedRegistrations: data.verifiedRegistrations,
        categoryDistribution: data.categoryDistribution || [],
        pendingVerification: data.totalRegistrations - data.verifiedRegistrations,
        ageDistribution: data.ageDistribution || [],
      })
    } catch (err) {
      console.error('Error fetching summary:', err)
    }
  }, [])

  // Separate useEffect for initial load
  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  // Separate useEffect for data fetching
  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const handleViewDetails = (registration: TournamentRegistration) => {
    setSelectedRegistration(registration)
    setIsDetailModalOpen(true)
  }

  const handleVerifyPayment = (registration: TournamentRegistration) => {
    setSelectedRegistration(registration)
    setIsVerifyModalOpen(true)
  }

  const handleVerifySubmit = async (data: {
    amount: number
    verifiedBy: string
    verificationNotes: string
  }) => {
    if (!selectedRegistration) return

    try {
      setError(null)
      const response = await fetch(
        `/api/admin/registrations/${selectedRegistration.id}/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: data.amount,
            verified_by: data.verifiedBy,
            verification_notes: data.verificationNotes,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to verify payment')
      }

      // Refresh data
      await Promise.all([
        fetchRegistrations(),
        fetchSummary()
      ])
      
      setIsVerifyModalOpen(false)
      toast.success(`Successfully verified payment for ${selectedRegistration.first_name} ${selectedRegistration.last_name}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify payment'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const columns: GridColDef<TournamentRegistration>[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => (
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5,
          '& .MuiIconButton-root': {
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'primary.lighter',
              color: 'primary.main',
            },
          }
        }}>
          <Tooltip title="View Details">
            <IconButton
              onClick={() => handleViewDetails(params.row)}
              size="small"
              sx={{ 
                color: 'text.secondary',
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canVerifyPayments && !params.row.is_verified && (
            <Tooltip title="Verify Payment">
              <IconButton
                onClick={() => handleVerifyPayment(params.row)}
                size="small"
                sx={{ 
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: 'success.lighter',
                    color: 'success.dark',
                  }
                }}
              >
                <VerifyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'registration_number',
      headerName: 'Registration #',
      width: 150,
      filterable: false,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          REG-{params.row.id.slice(0, 8).toUpperCase()}
        </Typography>
      ),
    },
    { 
      field: 'first_name', 
      headerName: 'First Name', 
      width: 130,
      filterable: true,
    },
    { 
      field: 'last_name', 
      headerName: 'Last Name', 
      width: 130,
      filterable: true,
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 200,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    { 
      field: 'phone_number',
      headerName: 'Phone', 
      width: 130,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            color: 'text.secondary',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'date_of_birth',
      headerName: 'Date of Birth',
      width: 180,
      filterable: true,
      type: 'date',
      valueGetter: (params: { row: TournamentRegistration }) => {
        if (!params?.row?.date_of_birth) return null;
        return new Date(params.row.date_of_birth);
      },
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => {
        if (!params.row.date_of_birth) return '-';
        const dob = new Date(params.row.date_of_birth);
        const cutoffDate = new Date('2025-04-30');
        
        // Calculate years
        const yearDiff = cutoffDate.getFullYear() - dob.getFullYear();
        const monthDiff = cutoffDate.getMonth() - dob.getMonth();
        const dayDiff = cutoffDate.getDate() - dob.getDate();
        
        // Calculate exact age
        const finalAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
          ? yearDiff - 1 
          : yearDiff;

        // Calculate remaining months and days
        let remainingMonths = monthDiff;
        if (remainingMonths < 0) remainingMonths += 12;
        if (dayDiff < 0) remainingMonths--;
        
        let remainingDays = dayDiff;
        if (remainingDays < 0) {
          const lastDayOfMonth = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), 0).getDate();
          remainingDays += lastDayOfMonth;
        }

        const ageDisplay = `${finalAge}y ${remainingMonths}m ${remainingDays}d`;

        return (
          <Stack spacing={0.5}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {dob.toLocaleDateString()}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Age on Apr 30, 2025: {ageDisplay}
            </Typography>
          </Stack>
        );
      },
    },
    { 
      field: 'registration_category',
      headerName: 'Category',
      width: 200,
      filterable: true,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => {
        const categoryMap = {
          'VOLLEYBALL_OPEN_MEN': 'Volleyball - Open',
          'THROWBALL_WOMEN': 'Throwball - Women',
          'THROWBALL_13_17_MIXED': 'Throwball - 13-17 Mixed',
          'THROWBALL_8_12_MIXED': 'Throwball - 8-12 Mixed',
        };
        const category = categoryMap[params.row.registration_category as keyof typeof categoryMap] || params.row.registration_category;
        const isVolleyball = params.row.registration_category.includes('VOLLEYBALL');
        const color = isVolleyball ? 'primary' : 'secondary';
        
        return (
          <Box
            sx={{
              backgroundColor: `${color}.lighter`,
              color: `${color}.dark`,
              py: 0.5,
              px: 1,
              borderRadius: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {category}
          </Box>
        );
      },
    },
    { 
      field: 'tshirt_size', 
      headerName: 'Jersey Size', 
      width: 100,
      filterable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: 'grey.100',
            color: 'grey.800',
            py: 0.5,
            px: 1,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            minWidth: '45px',
            textAlign: 'center',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    { 
      field: 'tshirt_number', 
      headerName: 'Jersey #', 
      width: 90,
      filterable: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'is_verified',
      headerName: 'Status',
      width: 120,
      filterable: true,
      type: 'boolean',
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => (
        <Box
          sx={{
            backgroundColor: params.value ? 'success.lighter' : 'warning.lighter',
            color: params.value ? 'success.dark' : 'warning.dark',
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {params.value ? (
            <>
              <VerifyIcon fontSize="small" />
              Verified
            </>
          ) : (
            'Pending'
          )}
        </Box>
      ),
    },
    {
      field: 'amount_received',
      headerName: 'Amount',
      width: 120,
      filterable: true,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            fontWeight: 600,
            color: params.row.is_verified ? 'success.main' : 'text.secondary',
          }}
        >
          {params.value ? 
            new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(params.value) : 
            '-'
          }
        </Typography>
      ),
    },
    {
      field: 'paid_to',
      headerName: 'Paid To',
      width: 130,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'payment_transaction_id',
      headerName: 'Transaction ID',
      width: 150,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            color: params.value ? 'text.primary' : 'text.secondary',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'payment_upi_id',
      headerName: 'UPI ID',
      width: 150,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace',
            color: params.value ? 'text.primary' : 'text.secondary',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'verified_by',
      headerName: 'Verified By',
      width: 130,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? 'success.main' : 'text.secondary',
            fontWeight: params.value ? 500 : 400,
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'verified_at',
      headerName: 'Verified At',
      width: 180,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value ? 'success.main' : 'text.secondary',
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {params.value ? new Date(params.value).toLocaleString() : '-'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 180,
      filterable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
  ]

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel)
  }, [])

  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => {
    // Reset to first page when filter changes
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    setFilterModel(newModel)
  }, [])

  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    // Reset to first page when sort changes
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    setSortModel(newModel)
  }, [])

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.grey[50]} 90%)`,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
        }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                Manage Registrations
                <Tooltip title="Refresh Data">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      fetchRegistrations()
                      fetchSummary()
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Tooltip title={isHeaderExpanded ? "Collapse Header" : "Expand Header"}>
                <IconButton 
                  onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                  size="small"
                  sx={{ 
                    transition: 'transform 0.3s',
                    transform: isHeaderExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  }}
                >
                  {isHeaderExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <Collapse in={isHeaderExpanded} timeout={300}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Track and manage tournament registrations
                </Typography>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: 'primary.lighter',
                    }
                  }}
                >
                  <Grid container spacing={3}>
                    {/* Registration Status */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                            display: 'flex',
                          }}>
                            <PeopleIcon />
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Total Registrations</Typography>
                            <Typography variant="h6">{summary.totalRegistrations}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={<VerifyIcon />}
                            label={`${summary.verifiedRegistrations} Verified`}
                            color="success"
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          {summary.pendingVerification > 0 && (
                            <Chip
                              icon={<WarningIcon />}
                              label={`${summary.pendingVerification} Pending`}
                              color="warning"
                              size="small"
                              sx={{ flex: 1 }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Grid>

                    {/* Vertical Divider */}
                    <Grid item xs={12} md="auto">
                      <Divider orientation="vertical" flexItem />
                    </Grid>

                    {/* Category Distribution */}
                    <Grid item xs={12} md={7}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Category Distribution
                      </Typography>
                      <Grid container spacing={2}>
                        {summary.categoryDistribution.map((item) => {
                          const isVolleyball = item.name.includes('VOLLEYBALL');
                          return (
                            <Grid item xs={12} sm={6} key={item.name}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ 
                                  p: 0.5, 
                                  borderRadius: 1, 
                                  bgcolor: isVolleyball ? 'info.lighter' : 'secondary.lighter',
                                  color: isVolleyball ? 'info.main' : 'secondary.main',
                                  display: 'flex',
                                }}>
                                  {isVolleyball ? <VolleyballIcon fontSize="small" /> : <ThrowballIcon fontSize="small" />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {CATEGORY_MAP[item.name as keyof typeof CATEGORY_MAP]}
                                  </Typography>
                                  <Typography variant="h6">
                                    {item.count}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Grid>

                    {/* Vertical Divider */}
                    <Grid item xs={12} md="auto">
                      <Divider orientation="vertical" flexItem />
                    </Grid>

                    {/* Age Distribution Chart */}
                    {summary.ageDistribution && summary.ageDistribution.length > 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 2 
                            }}
                          >
                            <BarChartIcon fontSize="small" />
                            Age Distribution
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                              height: 300,
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={summary.ageDistribution}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 25,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="age" 
                                  label={{ 
                                    value: 'Age (as of Apr 30, 2025)', 
                                    position: 'bottom',
                                    offset: 15
                                  }}
                                />
                                <YAxis
                                  label={{ 
                                    value: 'Number of Players', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    offset: 0
                                  }}
                                />
                                <RechartsTooltip
                                  formatter={(value: number, name: string) => [
                                    `${value} player${value !== 1 ? 's' : ''}`,
                                    'Count'
                                  ]}
                                  labelFormatter={(age: number) => `Age: ${age} years`}
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill={theme.palette.primary.main}
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Paper>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Box>
            </Collapse>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 1,
            }}
          >
            {error}
          </Alert>
        )}
      </Paper>

      <Paper 
        elevation={0}
        sx={{ 
          height: isHeaderExpanded ? 'calc(100vh - 250px)' : 'calc(100vh - 150px)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'height 0.3s',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Quick Filters */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Quick Filters:
            </Typography>
            <Stack direction="row" spacing={1}>
              {Object.entries(PAYMENT_RECEIVERS).map(([fullName, shortName]) => {
                const isActive = filterModel.items.some(
                  item => item.field === 'paid_to' && item.value === fullName
                );
                return (
                  <Chip
                    key={fullName}
                    label={`Paid to ${shortName}`}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'filled' : 'outlined'}
                    size="small"
                    onClick={() => {
                      if (isActive) {
                        // Remove the filter
                        setFilterModel({
                          ...filterModel,
                          items: filterModel.items.filter(
                            item => !(item.field === 'paid_to' && item.value === fullName)
                          ),
                        });
                      } else {
                        // Add the filter
                        setFilterModel({
                          ...filterModel,
                          items: [
                            ...filterModel.items,
                            {
                              field: 'paid_to',
                              operator: 'equals',
                              value: fullName,
                            },
                          ],
                        });
                      }
                    }}
                  />
                );
              })}
              {filterModel.items.some(item => item.field === 'paid_to') && (
                <Chip
                  label="Clear Payment Filters"
                  color="default"
                  variant="outlined"
                  size="small"
                  onDelete={() => {
                    setFilterModel({
                      ...filterModel,
                      items: filterModel.items.filter(item => item.field !== 'paid_to'),
                    });
                  }}
                />
              )}
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGridPro<TournamentRegistration>
            rows={registrations}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            filterMode="server"
            sortingMode="server"
            rowCount={totalRows}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50, 100]}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                printOptions: { disableToolbarButton: true },
                csvOptions: { 
                  disableToolbarButton: false,
                  utf8WithBom: true,
                  fileName: `tournament-registrations-${new Date().toISOString().split('T')[0]}`,
                  fields: [
                    'registration_number',
                    'first_name',
                    'last_name',
                    'email',
                    'phone_number',
                    'date_of_birth',
                    'registration_category',
                    'tshirt_size',
                    'tshirt_number',
                    'is_verified',
                    'amount_received',
                    'paid_to',
                    'payment_transaction_id',
                    'payment_upi_id',
                    'verified_by',
                    'verified_at',
                    'created_at'
                  ]
                },
                sx: {
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '& .MuiButton-root': {
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  },
                  '& .MuiInput-root': {
                    borderRadius: 1,
                  },
                },
              },
            }}
            sx={{
              height: '100%',
              width: '100%',
              border: 'none',
              '& .MuiDataGrid-main': {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.lighter',
                  '&:hover': {
                    backgroundColor: 'primary.lighter',
                  },
                },
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                color: 'text.primary',
                fontWeight: 600,
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-cell': {
                borderColor: theme.palette.divider,
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${theme.palette.divider}`,
                visibility: 'visible',
                position: 'sticky',
                bottom: 0,
                bgcolor: 'background.paper',
                zIndex: 2,
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: theme.palette.background.paper,
                flex: 1,
                minHeight: 200,
              },
              '& .MuiTablePagination-root': {
                visibility: 'visible',
              },
            }}
            getRowHeight={() => 'auto'}
            columnHeaderHeight={48}
            autoHeight={false}
            density="standard"
          />
        </Box>
      </Paper>

      {selectedRegistration && (
        <>
          <RegistrationDetailModal
            open={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            registration={selectedRegistration}
          />

          <VerifyPaymentModal
            open={isVerifyModalOpen}
            onClose={() => setIsVerifyModalOpen(false)}
            registration={selectedRegistration}
            onVerify={handleVerifySubmit}
            currentUser={getVerifierName(user?.email || '')}
          />
        </>
      )}
    </Box>
  )
} 