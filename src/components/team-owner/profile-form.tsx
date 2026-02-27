'use client'

import { useState, useEffect } from 'react'
import { useTeamOwnerProfile } from '@/hooks/use-team-owner'
import { TeamOwnerProfile, TeamOwnerUpdateRequest, ApiResponse } from '@/types/team-owner'
import { TextField, Button, Paper, Typography, Box, Avatar, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Divider, IconButton } from '@mui/material'
import { useToast } from '@/components/ui/use-toast'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import Image from 'next/image'
import GroupsIcon from '@mui/icons-material/Groups'
import EmailIcon from '@mui/icons-material/Email'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

interface Team {
  id: string;
  name: string;
}

export function TeamOwnerProfileForm() {
  const { profile, createProfile, updateProfile, handleImageUpload, handleImageDelete, handleTeamNameUpdate } = useTeamOwnerProfile()
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TeamOwnerUpdateRequest>({
    first_name: '',
    last_name: '',
    contact_email: '',
    bio: '',
    sports_background: '',
    notable_achievements: [],
    phone_number: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [dialogType, setDialogType] = useState<'cancel' | 'delete'>('cancel')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [teamName, setTeamName] = useState('')
  const [isEditingTeamName, setIsEditingTeamName] = useState(false)

  useEffect(() => {
    // Fetch available teams for the user
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams/available')
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setTeams(data.data || [])
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch available teams',
          variant: 'destructive',
        })
      }
    }

    fetchTeams()
  }, [toast])

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        team_id: profile.team_id || '',
        contact_email: profile.contact_email,
        bio: profile.bio,
        sports_background: profile.sports_background,
        notable_achievements: profile.notable_achievements,
        phone_number: profile.phone_number || '',
        profile_image_url: profile.profile_image_url || '',
      })
      setSelectedTeam(profile.team_id || '')
      setTeamName(profile.team_name || '')
      setPreviewUrl(profile.profile_image_url || null)
      setIsEditing(true)
    }
  }, [profile])

  useEffect(() => {
    // Listen for edit-profile event
    const handleEditProfile = (event: CustomEvent<TeamOwnerProfile>) => {
      const profile = event.detail;
      // Clean up previous preview URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      // Reset form errors
      setFormErrors({});
      // Reset form data with new profile
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        team_id: profile.team_id || '',
        sports_background: profile.sports_background || '',
        notable_achievements: profile.notable_achievements || [],
        contact_email: profile.contact_email,
        phone_number: profile.phone_number || '',
        profile_image_url: profile.profile_image_url || '',
        bio: profile.bio,
      });
      setSelectedFile(null);
      setIsEditing(true);
      setSelectedTeam(profile.team_id || '');
      setTeamName(profile.team_name || '')
      setPreviewUrl(profile.profile_image_url || null);
      setShowConfirmDialog(false);
    }

    window.addEventListener('edit-profile', handleEditProfile as EventListener)
    return () => {
      window.removeEventListener('edit-profile', handleEditProfile as EventListener)
      // Clean up preview URL when component unmounts
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  }, [previewUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'phone_number') {
      // Format Indian phone number
      const cleaned = value.replace(/\D/g, '')
      let formatted = cleaned
      if (cleaned.length > 0) {
        if (cleaned.length <= 10) {
          formatted = cleaned
        } else {
          formatted = cleaned.slice(0, 10)
        }
      }
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
      return
    }

    if (name === 'notable_achievements') {
      setFormData(prev => ({
        ...prev,
        notable_achievements: value.split('\n')
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTeamChange = (event: SelectChangeEvent) => {
    const teamId = event.target.value
    setSelectedTeam(teamId)
    const selectedTeamData = teams.find(t => t.id === teamId)
    if (selectedTeamData) {
      setTeamName(selectedTeamData.name)
    }
    setFormData(prev => ({
      ...prev,
      team_id: teamId
    }))
  }

  const handleTeamNameSubmit = async () => {
    if (!selectedTeam || !teamName.trim()) return

    try {
      setIsLoading(true)
      await handleTeamNameUpdate(selectedTeam, { name: teamName.trim() })
      setIsEditingTeamName(false)
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
    } finally {
      setIsLoading(false)
    }
  }

  // Add form validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    console.log('Running form validation with data:', formData);
    
    // Required fields validation
    if (!formData.first_name?.trim()) {
      errors.first_name = 'First name is required'
    }
    
    if (!formData.last_name?.trim()) {
      errors.last_name = 'Last name is required'
    }
    
    if (!formData.bio?.trim()) {
      errors.bio = 'Bio is required'
    }
    
    // Phone number validation (Indian format)
    if (formData.phone_number && !/^[6-9]\d{9}$/.test(formData.phone_number)) {
      errors.phone_number = 'Please enter a valid 10-digit Indian mobile number'
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.contact_email) {
      errors.contact_email = 'Email is required'
    } else if (!emailPattern.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address'
    }

    // Sports background length validation
    if (formData.sports_background && formData.sports_background.length > 1000) {
      errors.sports_background = 'Sports background should not exceed 1000 characters'
    }

    // Bio length validation
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio should not exceed 500 characters'
    }

    // Log validation errors for debugging
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors)
    } else {
      console.log('Form validation passed')
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCancel = () => {
    if (isEditing) {
      setDialogType('cancel')
      setShowConfirmDialog(true)
    }
  }

  const handleConfirmCancel = () => {
    // Clean up any existing blob URL before resetting
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormData({
      first_name: '',
      last_name: '',
      contact_email: '',
      bio: '',
      sports_background: '',
      notable_achievements: [],
      phone_number: '',
      profile_image_url: ''
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setSelectedTeam('')
    setIsEditing(false)
    setShowConfirmDialog(false)
    setFormErrors({})
  }

  const handleDeleteImageClick = () => {
    setDialogType('delete')
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = async () => {
    await handleDeleteImage()
    setShowConfirmDialog(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission attempted with data:', formData)
    console.log('Submit button clicked, running validation...')
    
    if (!validateForm()) {
      console.log('Validation failed, showing toast')
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form',
        variant: 'destructive',
      })
      return
    }

    console.log('Validation passed, proceeding with form submission')
    await submitForm()
  }

  const submitForm = async () => {
    setIsLoading(true)
    try {
      console.log('Submitting form data:', formData);
      
      // Upload image if selected
      if (selectedFile) {
        console.log('Uploading image file:', selectedFile.name);
        try {
          const uploadResponse = await handleImageUpload(selectedFile)
          formData.profile_image_url = uploadResponse.data.imageUrl
          console.log('Image uploaded successfully:', uploadResponse.data.imageUrl);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload profile image');
        }
      }

      // Submit profile data
      console.log('Submitting profile data:', formData);
      const response = await (isEditing ? updateProfile(formData) : createProfile(formData))
      console.log('Profile submission response:', response);

      toast({
        title: 'Success',
        description: `Profile ${isEditing ? 'updated' : 'created'} successfully`,
      })

      // Reset form
      handleConfirmCancel()
      
      // Refresh profile list
      window.dispatchEvent(new CustomEvent('profile-updated'))
    } catch (error) {
      console.error('Profile submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save profile',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!formData.profile_image_url) {
      return
    }

    try {
      await handleImageDelete(formData.profile_image_url)
      setPreviewUrl(null)
      setFormData(prev => ({ ...prev, profile_image_url: undefined }))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete image',
        variant: 'destructive',
      })
    }
  }

  return (
    <Paper 
      elevation={0} 
      className="p-6 bg-gradient-to-br from-background-primary to-background-secondary animate-fadeIn"
    >
      {/* Contextual Header */}
      <div className="mb-8 text-center animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          <SportsVolleyballIcon className="text-primary-600 text-4xl mr-2 animate-spin-slow" />
          <Typography variant="h4" className="text-primary-700 font-bold">
            {isEditing ? 'Edit Team Owner Profile' : 'Create Team Owner Profile'}
          </Typography>
        </div>
        <Typography variant="subtitle1" className="text-gray-600 max-w-2xl mx-auto">
          As a team owner in our community tournament, your profile helps establish your team's presence and credibility. 
          Please provide detailed information to enhance tournament engagement.
        </Typography>
      </div>

      <form 
        onSubmit={(e) => {
          console.log('Form onSubmit event triggered');
          handleSubmit(e);
        }} 
        className="space-y-8"
      >
        {/* Team Information Section */}
        <div className="bg-blue-50 p-6 rounded-lg animate-slideInFromBottom">
          <Typography variant="h6" className="text-primary-700 mb-4 flex items-center">
            <GroupsIcon className="mr-2" />
            Team Information
          </Typography>
          <div className="space-y-4">
            <FormControl fullWidth error={Boolean(formErrors.team_id)} sx={{ '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' } }}>
              <InputLabel>Select Team</InputLabel>
              <Select
                value={formData.team_id || ''}
                onChange={handleTeamChange}
                className="bg-white transition-all duration-300 hover:border-primary-500"
                sx={{ '& .MuiSelect-select': { color: '#1f2937' } }}
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.team_id && (
                <Typography variant="caption" color="error">
                  {formErrors.team_id}
                </Typography>
              )}
            </FormControl>

            {selectedTeam && (
              <div className="animate-fadeIn">
                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamName}
                  disabled={!isEditingTeamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-white"
                  sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' } }}
                  InputProps={{
                    endAdornment: (
                      <div className="flex space-x-2 animate-fadeIn">
                        {isEditingTeamName ? (
                          <>
                            <IconButton
                              onClick={handleTeamNameSubmit}
                              className="text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => setIsEditingTeamName(false)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            onClick={() => setIsEditingTeamName(true)}
                            className="text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </div>
                    ),
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Image Section */}
        <div className="bg-gray-50 p-6 rounded-lg animate-slideInFromBottom">
          <Typography variant="h6" className="text-primary-700 mb-4 flex items-center">
            <CameraAltIcon className="mr-2" />
            Profile Image
          </Typography>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Profile"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteImageClick}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 animate-fadeIn"
                      title="Delete profile image"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <PersonIcon className="text-gray-400 text-4xl" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      const objectUrl = URL.createObjectURL(file)
                      setPreviewUrl(objectUrl)
                    }
                  }}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="cursor-pointer bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-300"
                >
                  <CameraAltIcon />
                </label>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Typography variant="subtitle2" className="text-gray-600">
                Upload a professional profile photo
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Recommended: Square image, at least 400x400px
              </Typography>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg animate-slideInFromBottom">
          <Typography variant="h6" className="text-primary-700 mb-4 flex items-center">
            <PersonIcon className="mr-2" />
            Personal Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={Boolean(formErrors.first_name)}
              helperText={formErrors.first_name}
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={Boolean(formErrors.last_name)}
              helperText={formErrors.last_name}
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg animate-slideInFromBottom">
          <Typography variant="h6" className="text-primary-700 mb-4 flex items-center">
            <EmailIcon className="mr-2" />
            Contact Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Contact Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              required
              error={Boolean(formErrors.contact_email)}
              helperText={formErrors.contact_email}
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
            />
            <TextField
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number || ''}
              onChange={handleChange}
              fullWidth
              placeholder="Example: 9876543210"
              error={Boolean(formErrors.phone_number)}
              helperText={formErrors.phone_number || "Enter 10-digit Indian mobile number starting with 6-9"}
              inputProps={{
                maxLength: 10,
                pattern: "[6-9][0-9]{9}"
              }}
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
            />
          </div>
        </div>

        {/* Sports Profile Section */}
        <div className="bg-gray-50 p-6 rounded-lg animate-slideInFromBottom">
          <Typography variant="h6" className="text-primary-700 mb-4 flex items-center">
            <EmojiEventsIcon className="mr-2" />
            Sports Profile
          </Typography>
          <div className="space-y-6">
            <TextField
              label="Sports Background"
              name="sports_background"
              value={formData.sports_background || ''}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
              placeholder="Share your experience in sports, including any coaching, playing, or management roles"
            />
            <TextField
              label="Notable Achievements"
              name="notable_achievements"
              value={formData.notable_achievements?.join('\n') || ''}
              onChange={handleChange}
              multiline
              minRows={4}
              maxRows={8}
              fullWidth
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
              placeholder="List your achievements in sports (one per line)"
              helperText="Press Enter for each new achievement"
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-gray-50 p-6 rounded-lg animate-slideInFromBottom">
          <Typography variant="h6" className="text-primary-700 mb-4 flex items-center">
            <PersonOutlineIcon className="mr-2" />
            Bio
          </Typography>
          <div className="space-y-6">
            <TextField
              label="Bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              multiline
              rows={4}
              required
              error={Boolean(formErrors.bio)}
              helperText={formErrors.bio || "Tell us about your passion for sports and your vision for the team"}
              fullWidth
              className="bg-white transition-all duration-300 hover:border-primary-500"
              sx={{ '& .MuiInputBase-input': { color: '#1f2937' }, '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' }, '& .MuiFormHelperText-root': { color: '#6b7280' } }}
              placeholder="Tell us about your passion for sports and your vision for the team"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 animate-slideIn">
          <Button
            variant="outlined"
            onClick={handleCancel}
            className="transition-all duration-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => console.log('Submit button clicked directly')}
            className="bg-primary-600 hover:bg-primary-700 transition-all duration-300"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <Typography variant="h6" className="text-yellow-800 mb-2 font-bold">Debug Tools (Development Only)</Typography>
          <div className="flex flex-wrap gap-4">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                console.log('Debug button clicked outside form');
                console.log('Current form data:', formData);
                console.log('Form errors:', formErrors);
                console.log('Validation result:', validateForm());
                alert(`Form data: ${JSON.stringify({
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  team_id: formData.team_id,
                  contact_email: formData.contact_email,
                  bio: formData.bio
                }, null, 2)}`);
              }}
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-all duration-300"
            >
              Debug Form Data
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        className="animate-fadeIn"
      >
        <DialogTitle>
          {dialogType === 'cancel' ? 'Discard Changes?' : 'Delete Profile Image?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogType === 'cancel' 
              ? 'Are you sure you want to discard your changes? This action cannot be undone.'
              : 'Are you sure you want to delete your profile image? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={dialogType === 'cancel' ? handleConfirmCancel : handleConfirmDelete}
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
} 