'use client'

import '@/lib/mui-license'; // Import MUI license utility
import { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  DataGridPro,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid-pro'
import {
  ContentCopy as CopyIcon,
  PhotoCamera as CameraIcon,
  CheckCircle as VerifiedIcon,
} from '@mui/icons-material'
import { TournamentRegistration } from '@/features/tournaments/types/registration'
import toast from 'react-hot-toast'

export default function VolleyballPlayersPage() {
  const [players, setPlayers] = useState<TournamentRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/volleyball-players')
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }

      const data = await response.json()
      setPlayers(data.players)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch players'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const generateProfileLink = useCallback(async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/volleyball-players/${playerId}/profile-link`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate profile link')
      }

      const { token } = await response.json()
      // Safely access window.location.origin with a fallback
      const origin = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const profileUrl = `${origin}/profile/${token}`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(profileUrl)
      toast.success('Profile link copied to clipboard')
      
      // Refresh the list to show updated token
      fetchPlayers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate profile link'
      toast.error(errorMessage)
    }
  }, [fetchPlayers])

  const columns: GridColDef<TournamentRegistration>[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => {
        if (!params || !params.row) return null;
        
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title={params.row.profile_token ? "Copy Profile Link" : "Generate Profile Link"}>
              <IconButton
                size="small"
                onClick={() => generateProfileLink(params.row.id)}
                color={params.row.profile_token ? "primary" : "default"}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {params.row.profile_image_url && (
              <Tooltip title="Has Profile Image">
                <VerifiedIcon color="success" fontSize="small" />
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
    {
      field: 'first_name',
      headerName: 'First Name',
      width: 130,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      width: 130,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'phone_number',
      headerName: 'Phone',
      width: 130,
    },
    {
      field: 'tshirt_size',
      headerName: 'Jersey Size',
      width: 100,
    },
    {
      field: 'tshirt_number',
      headerName: 'Jersey #',
      width: 90,
    },
    {
      field: 'profile_status',
      headerName: 'Profile Status',
      width: 150,
      renderCell: (params: GridRenderCellParams<TournamentRegistration>) => {
        if (!params || !params.row) return null;
        
        return (
          <Box
            sx={{
              backgroundColor: params.row.profile_image_url ? 'success.lighter' : 'warning.lighter',
              color: params.row.profile_image_url ? 'success.dark' : 'warning.dark',
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
            {params.row.profile_image_url ? (
              <>
                <CameraIcon fontSize="small" />
                Image Added
              </>
            ) : (
              'No Image'
            )}
          </Box>
        );
      },
    },
  ]

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
              Volleyball Players Profile Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate and manage profile links for volleyball players to upload their photos.
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <DataGridPro
          rows={players}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              printOptions: { disableToolbarButton: true },
              csvOptions: { disableToolbarButton: true },
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
      </Paper>
    </Box>
  )
} 