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

  // Add event listener for profile updates
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
    // Store the profile data in sessionStorage
    sessionStorage.setItem('editProfile', JSON.stringify(profile))
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Dispatch event to load profile in form
    window.dispatchEvent(new CustomEvent('edit-profile', { detail: profile }))
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64 bg-gray-50 rounded-lg animate-pulse">
        <div className="text-center space-y-4">
          <SportsVolleyballIcon className="text-primary-400 text-4xl animate-spin" />
          <Typography className="animate-pulse">Loading profiles...</Typography>
        </div>
      </Box>
    )
  }

  if (profiles.length === 0) {
    return (
      <Box className="flex justify-center items-center h-64 bg-gray-50 rounded-lg animate-fadeIn">
        <div className="text-center space-y-4">
          <GroupsIcon className="text-gray-400 text-4xl animate-bounce" />
          <Typography className="text-gray-600">No profiles found</Typography>
        </div>
      </Box>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SportsVolleyballIcon className="text-primary-600 text-2xl animate-spin-slow" />
            <Typography variant="h5" className="text-primary-700 font-semibold">
              Team Owner Profiles
            </Typography>
          </div>
          <Chip
            label={`${profiles.length} ${profiles.length === 1 ? 'Profile' : 'Profiles'}`}
            color="primary"
            variant="outlined"
            size="small"
            className="animate-fadeIn"
          />
        </div>

        <TableContainer component={Paper} className="border rounded-lg overflow-hidden transition-all duration-300">
          <Table>
            <TableHead>
              <TableRow className="bg-primary-50">
                <TableCell className="font-semibold text-primary-700">Actions</TableCell>
                <TableCell className="font-semibold text-primary-700">Profile</TableCell>
                <TableCell className="font-semibold text-primary-700">Name</TableCell>
                <TableCell className="font-semibold text-primary-700">Role</TableCell>
                <TableCell className="font-semibold text-primary-700">Contact</TableCell>
                <TableCell className="font-semibold text-primary-700">Background</TableCell>
                <TableCell className="font-semibold text-primary-700">Achievements</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.map((profile, index) => (
                <TableRow 
                  key={profile.id}
                  className="hover:bg-gray-50 transition-all duration-300 animate-slideInFromBottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TableCell>
                    <Tooltip title="Edit Profile" className="animate-fadeIn">
                      <IconButton
                        onClick={() => handleEdit(profile)}
                        size="small"
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={profile.profile_image_url || undefined}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {profile.first_name?.[0]?.toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" className="font-semibold text-primary-700">
                      {profile.first_name} {profile.last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={profile.team_role || 'Owner'}
                      size="small"
                      color="primary"
                      variant="outlined"
                      className="font-medium"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-gray-700">
                      {profile.contact_email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      className="max-w-xs truncate text-gray-700"
                      title={profile.sports_background || ''}
                    >
                      {profile.sports_background || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {profile.notable_achievements?.length ? (
                      <div className="max-h-24 overflow-y-auto">
                        <ul className="list-disc pl-4 space-y-1">
                          {profile.notable_achievements.map((achievement, index) => (
                            <li key={index}>
                              <Typography 
                                variant="body2" 
                                className="truncate max-w-xs text-gray-700" 
                                title={achievement}
                              >
                                {achievement}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Typography variant="body2" className="text-gray-500">N/A</Typography>
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