'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import PersonIcon from '@mui/icons-material/Person'
import GroupsIcon from '@mui/icons-material/Groups'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

interface OwnerTracking {
  id: string
  email: string
  name: string
  signed_up: boolean
  profile_completed: boolean
  profile_name: string | null
  profile_has_image: boolean
  profile_has_bio: boolean
  profile_has_background: boolean
  profile_updated_at: string | null
  team_assigned: boolean
  team_name: string | null
  team_id: string | null
}

interface Summary {
  total: number
  signed_up: number
  profile_completed: number
  team_assigned: number
}

function StatusIcon({ done }: { done: boolean }) {
  return done ? (
    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
  ) : (
    <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
  )
}

function SummaryCard({
  label,
  count,
  total,
  icon,
  color,
}: {
  label: string
  count: number
  total: number
  icon: React.ReactNode
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {icon}
          <Typography color="textSecondary" variant="body2">
            {label}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {count}
          <Typography component="span" variant="body1" color="textSecondary">
            {' '}/ {total}
          </Typography>
        </Typography>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            mt: 1.5,
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
          }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
          {pct}% complete
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function OwnerTrackingPage() {
  const [tracking, setTracking] = useState<OwnerTracking[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, signed_up: 0, profile_completed: 0, team_assigned: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/owner-tracking')
        if (!res.ok) throw new Error('Failed to fetch tracking data')
        const data = await res.json()
        setTracking(data.tracking || [])
        setSummary(data.summary || { total: 0, signed_up: 0, profile_completed: 0, team_assigned: 0 })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Owner Setup Tracking
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          Track which team owners have signed up, completed their profile, and been assigned a team.
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              label="Signed Up"
              count={summary.signed_up}
              total={summary.total}
              icon={<HowToRegIcon sx={{ color: '#2196f3' }} />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              label="Profile Completed"
              count={summary.profile_completed}
              total={summary.total}
              icon={<PersonIcon sx={{ color: '#4caf50' }} />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              label="Team Assigned"
              count={summary.team_assigned}
              total={summary.total}
              icon={<GroupsIcon sx={{ color: '#ff9800' }} />}
              color="#ff9800"
            />
          </Grid>
        </Grid>

        {/* Tracking Table */}
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Owner Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Email</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Signed Up</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Profile</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Photo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Team</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tracking.map((owner) => {
                const steps = [owner.signed_up, owner.profile_completed, owner.team_assigned]
                const completedSteps = steps.filter(Boolean).length
                const statusLabel =
                  completedSteps === 3
                    ? 'Ready'
                    : completedSteps === 0
                      ? 'Not Started'
                      : 'In Progress'
                const statusColor =
                  completedSteps === 3
                    ? 'success'
                    : completedSteps === 0
                      ? 'error'
                      : ('warning' as const)

                return (
                  <TableRow key={owner.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {owner.profile_name || owner.name}
                      </Typography>
                      {owner.profile_name && owner.profile_name !== owner.name && (
                        <Typography variant="caption" color="textSecondary">
                          (registered as: {owner.name})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {owner.email}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusIcon done={owner.signed_up} />
                    </TableCell>
                    <TableCell align="center">
                      <StatusIcon done={owner.profile_completed} />
                    </TableCell>
                    <TableCell align="center">
                      {owner.profile_completed ? (
                        owner.profile_has_image ? (
                          <PhotoCameraIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : (
                          <CancelIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                        )
                      ) : (
                        <Typography variant="caption" color="textSecondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {owner.team_assigned ? (
                        <Chip label={owner.team_name} size="small" color="primary" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="textSecondary">No team</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabel}
                        size="small"
                        color={statusColor}
                        variant={completedSteps === 3 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {tracking.length === 0 && (
          <Box textAlign="center" py={6}>
            <Typography color="textSecondary">No team owners found in the database.</Typography>
          </Box>
        )}
      </Box>
    </Container>
  )
}
