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
  Divider,
  TextField
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import GroupsIcon from '@mui/icons-material/Groups'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { TeamOwnerProfile } from '@/types/team-owner'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useTeamOwnerProfile } from '@/hooks/use-team-owner'

export function ProfileList() {
  const [profiles, setProfiles] = useState<TeamOwnerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTeamName, setEditingTeamName] = useState<{ id: string; name: string } | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { handleTeamNameUpdate } = useTeamOwnerProfile()

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

  const handleTeamNameEdit = (profile: TeamOwnerProfile) => {
    setEditingTeamName({
      id: profile.team_id,
      name: profile.team_name || ''
    })
  }

  const handleTeamNameSave = async () => {
    if (!editingTeamName) return

    try {
      await handleTeamNameUpdate(editingTeamName.id, { name: editingTeamName.name.trim() })
      setEditingTeamName(null)
      await fetchProfiles() // Refresh the list
      toast({
        title: 'Success',
        description: 'Team name updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update team name',
        variant: 'destructive',
      })
    }
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
                <TableCell className="font-semibold text-primary-700">Profile</TableCell>
                <TableCell className="font-semibold text-primary-700">Name</TableCell>
                <TableCell className="font-semibold text-primary-700">Team</TableCell>
                <TableCell className="font-semibold text-primary-700">Role</TableCell>
                <TableCell className="font-semibold text-primary-700">Contact</TableCell>
                <TableCell className="font-semibold text-primary-700">Phone</TableCell>
                <TableCell className="font-semibold text-primary-700">Background</TableCell>
                <TableCell className="font-semibold text-primary-700">Achievements</TableCell>
                <TableCell className="font-semibold text-primary-700">Social Media</TableCell>
                <TableCell className="font-semibold text-primary-700">Actions</TableCell>
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
                    {editingTeamName?.id === profile.team_id ? (
                      <div className="flex items-center space-x-2 animate-fadeIn">
                        <TextField
                          value={editingTeamName.name}
                          onChange={(e) => setEditingTeamName(prev => prev ? { ...prev, name: e.target.value } : null)}
                          size="small"
                          className="min-w-[200px] transition-all duration-300"
                          autoFocus
                        />
                        <div className="flex items-center space-x-1">
                          <IconButton
                            onClick={handleTeamNameSave}
                            size="small"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </IconButton>
                          <IconButton
                            onClick={() => setEditingTeamName(null)}
                            size="small"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </IconButton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Chip
                          label={profile.team_name || 'N/A'}
                          size="small"
                          className="bg-blue-50 text-blue-700 font-medium transition-all duration-300 hover:bg-blue-100"
                        />
                        <IconButton
                          onClick={() => handleTeamNameEdit(profile)}
                          size="small"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300"
                        >
                          <DriveFileRenameOutlineIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )}
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
                    <Typography variant="body2" className="text-gray-700">
                      {profile.phone_number || 'N/A'}
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
                  <TableCell>
                    <Typography variant="body2" className="text-gray-700">
                      {profile.social_media ? 
                        Object.entries(profile.social_media)
                          .filter(([_, value]) => value)
                          .map(([platform, url]) => platform)
                          .join(', ') || 'N/A'
                        : 'N/A'}
                    </Typography>
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  )
} 