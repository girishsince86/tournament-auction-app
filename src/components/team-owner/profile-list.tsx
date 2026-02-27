'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import GroupsIcon from '@mui/icons-material/Groups'
import { TeamOwnerProfile } from '@/types/team-owner'
import { useToast } from '@/components/ui/use-toast'

export function ProfileList() {
  const [profiles, setProfiles] = useState<TeamOwnerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/team-management/owner-profiles')
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setProfiles(data.data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profiles',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfiles()
    }

    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate)
    }
  }, [])

  const handleEdit = (profile: TeamOwnerProfile) => {
    sessionStorage.setItem('editProfile', JSON.stringify(profile))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.dispatchEvent(new CustomEvent('edit-profile', { detail: profile }))
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-48 bg-gray-50 rounded-lg">
        <div className="text-center space-y-3">
          <SportsVolleyballIcon className="text-gray-400 text-3xl" />
          <Typography className="text-gray-500">Loading profiles...</Typography>
        </div>
      </Box>
    )
  }

  if (profiles.length === 0) {
    return (
      <Box className="flex justify-center items-center h-48 bg-gray-50 rounded-lg">
        <div className="text-center space-y-3">
          <GroupsIcon className="text-gray-300 text-4xl" />
          <Typography className="text-gray-500">No profiles found</Typography>
        </div>
      </Box>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SportsVolleyballIcon className="text-primary-600 text-xl" />
            <Typography variant="h6" className="text-gray-800 font-semibold">
              Team Owner Profiles
            </Typography>
          </div>
          <Chip
            label={`${profiles.length} ${profiles.length === 1 ? 'Profile' : 'Profiles'}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </div>

        <TableContainer component={Paper} elevation={0} className="border border-gray-100 rounded-lg overflow-hidden">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold text-gray-600" sx={{ width: 60 }}>Edit</TableCell>
                <TableCell className="font-semibold text-gray-600" sx={{ width: 60 }}></TableCell>
                <TableCell className="font-semibold text-gray-600">Name</TableCell>
                <TableCell className="font-semibold text-gray-600">Role</TableCell>
                <TableCell className="font-semibold text-gray-600">Contact</TableCell>
                <TableCell className="font-semibold text-gray-600">Background</TableCell>
                <TableCell className="font-semibold text-gray-600">Achievements</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell>
                    <Tooltip title="Edit Profile">
                      <IconButton
                        onClick={() => handleEdit(profile)}
                        size="small"
                        className="text-primary-600 hover:bg-primary-50"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={profile.profile_image_url || undefined}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid',
                        borderColor: 'grey.200',
                        fontSize: '0.875rem',
                      }}
                    >
                      {profile.first_name?.[0]?.toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-medium text-gray-800">
                      {profile.first_name} {profile.last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={profile.team_role || 'Owner'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-gray-600">
                      {profile.contact_email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      className="max-w-xs truncate text-gray-600"
                      title={profile.sports_background || ''}
                    >
                      {profile.sports_background || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {profile.notable_achievements?.length ? (
                      <div className="max-h-20 overflow-y-auto">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {profile.notable_achievements.map((achievement, idx) => (
                            <li key={idx}>
                              <Typography
                                variant="caption"
                                className="text-gray-600"
                                title={achievement}
                              >
                                {achievement}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Typography variant="body2" className="text-gray-400">N/A</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
}
