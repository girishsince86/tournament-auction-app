'use client'

import { useState, useEffect } from 'react'
import { useTeamOwnerProfile } from '@/hooks/use-team-owner'
import { TeamOwnerProfile, TeamOwnerUpdateRequest } from '@/types/team-owner'
import { TextField, Button, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, IconButton } from '@mui/material'
import { useToast } from '@/components/ui/use-toast'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import Image from 'next/image'
import EmailIcon from '@mui/icons-material/Email'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

// Shared sx overrides for MUI text fields on light backgrounds
const textFieldSx = {
  '& .MuiInputBase-input': { color: '#1f2937' },
  '& .MuiInputLabel-root:not(.Mui-focused)': { color: '#6b7280' },
  '& .MuiFormHelperText-root': { color: '#6b7280' },
}

export function TeamOwnerProfileForm() {
  const { profile, createProfile, updateProfile, handleImageUpload, handleImageDelete } = useTeamOwnerProfile()
  const { toast } = useToast()
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

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        contact_email: profile.contact_email,
        bio: profile.bio,
        sports_background: profile.sports_background,
        notable_achievements: profile.notable_achievements,
        phone_number: profile.phone_number || '',
        profile_image_url: profile.profile_image_url || '',
      })
      setPreviewUrl(profile.profile_image_url || null)
      setIsEditing(true)
    }
  }, [profile])

  useEffect(() => {
    const handleEditProfile = (event: CustomEvent<TeamOwnerProfile>) => {
      const profileData = event.detail;
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setFormErrors({});
      setFormData({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        sports_background: profileData.sports_background || '',
        notable_achievements: profileData.notable_achievements || [],
        contact_email: profileData.contact_email,
        phone_number: profileData.phone_number || '',
        profile_image_url: profileData.profile_image_url || '',
        bio: profileData.bio,
      });
      setSelectedFile(null);
      setIsEditing(true);
      setPreviewUrl(profileData.profile_image_url || null);
      setShowConfirmDialog(false);
    }

    window.addEventListener('edit-profile', handleEditProfile as EventListener)
    return () => {
      window.removeEventListener('edit-profile', handleEditProfile as EventListener)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  }, [previewUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'phone_number') {
      const cleaned = value.replace(/\D/g, '')
      setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 10) }))
      return
    }

    if (name === 'notable_achievements') {
      setFormData(prev => ({ ...prev, notable_achievements: value.split('\n') }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.first_name?.trim()) errors.first_name = 'First name is required'
    if (!formData.last_name?.trim()) errors.last_name = 'Last name is required'
    if (!formData.bio?.trim()) errors.bio = 'Bio is required'

    if (formData.phone_number && !/^[6-9]\d{9}$/.test(formData.phone_number)) {
      errors.phone_number = 'Please enter a valid 10-digit Indian mobile number'
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.contact_email) {
      errors.contact_email = 'Email is required'
    } else if (!emailPattern.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address'
    }

    if (formData.sports_background && formData.sports_background.length > 1000) {
      errors.sports_background = 'Sports background should not exceed 1000 characters'
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio should not exceed 500 characters'
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

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form',
        variant: 'destructive',
      })
      return
    }

    await submitForm()
  }

  const submitForm = async () => {
    setIsLoading(true)
    try {
      if (selectedFile) {
        try {
          const uploadResponse = await handleImageUpload(selectedFile)
          formData.profile_image_url = uploadResponse.data.imageUrl
        } catch {
          throw new Error('Failed to upload profile image');
        }
      }

      await (isEditing ? updateProfile(formData) : createProfile(formData))

      toast({
        title: 'Success',
        description: `Profile ${isEditing ? 'updated' : 'created'} successfully`,
      })

      handleConfirmCancel()
      window.dispatchEvent(new CustomEvent('profile-updated'))
    } catch (error) {
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
    if (!formData.profile_image_url) return

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
    <Paper elevation={0} className="p-6 rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-3">
          <SportsVolleyballIcon className="text-primary-600 text-3xl mr-2" />
          <Typography variant="h4" className="text-primary-700 font-bold font-sports-display tracking-wide">
            {isEditing ? 'Edit Profile' : 'Create Profile'}
          </Typography>
        </div>
        <Typography variant="body2" className="text-gray-500 max-w-xl mx-auto">
          Your profile establishes your team&apos;s presence in the tournament.
        </Typography>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
          <Typography variant="subtitle1" className="text-gray-800 mb-4 flex items-center font-semibold">
            <CameraAltIcon className="mr-2 text-gray-500" fontSize="small" />
            Profile Image
          </Typography>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-primary-300 transition-colors duration-200">
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteImageClick}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors focus:outline-none"
                      title="Delete profile image"
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <PersonIcon className="text-gray-300 text-4xl" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      setPreviewUrl(URL.createObjectURL(file))
                    }
                  }}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="cursor-pointer bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <CameraAltIcon fontSize="small" />
                </label>
              </div>
            </div>
            <div>
              <Typography variant="body2" className="text-gray-600">
                Upload a professional photo
              </Typography>
              <Typography variant="caption" className="text-gray-400">
                Square image, at least 400x400px
              </Typography>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
          <Typography variant="subtitle1" className="text-gray-800 mb-4 flex items-center font-semibold">
            <PersonIcon className="mr-2 text-gray-500" fontSize="small" />
            Personal Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={Boolean(formErrors.first_name)}
              helperText={formErrors.first_name}
              className="bg-white"
              sx={textFieldSx}
            />
            <TextField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={Boolean(formErrors.last_name)}
              helperText={formErrors.last_name}
              className="bg-white"
              sx={textFieldSx}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
          <Typography variant="subtitle1" className="text-gray-800 mb-4 flex items-center font-semibold">
            <EmailIcon className="mr-2 text-gray-500" fontSize="small" />
            Contact Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Contact Email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              required
              error={Boolean(formErrors.contact_email)}
              helperText={formErrors.contact_email}
              className="bg-white"
              sx={textFieldSx}
            />
            <TextField
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number || ''}
              onChange={handleChange}
              fullWidth
              placeholder="9876543210"
              error={Boolean(formErrors.phone_number)}
              helperText={formErrors.phone_number || "10-digit Indian mobile number"}
              inputProps={{ maxLength: 10, pattern: "[6-9][0-9]{9}" }}
              className="bg-white"
              sx={textFieldSx}
            />
          </div>
        </div>

        {/* Sports Profile */}
        <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
          <Typography variant="subtitle1" className="text-gray-800 mb-4 flex items-center font-semibold">
            <EmojiEventsIcon className="mr-2 text-gray-500" fontSize="small" />
            Sports Profile
          </Typography>
          <div className="space-y-4">
            <TextField
              label="Sports Background"
              name="sports_background"
              value={formData.sports_background || ''}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              className="bg-white"
              sx={textFieldSx}
              placeholder="Your experience in sports — coaching, playing, or management roles"
            />
            <TextField
              label="Notable Achievements"
              name="notable_achievements"
              value={formData.notable_achievements?.join('\n') || ''}
              onChange={handleChange}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              className="bg-white"
              sx={textFieldSx}
              placeholder="List achievements, one per line"
              helperText="Press Enter for each new achievement"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="p-5 rounded-lg border border-gray-100 bg-gray-50/50">
          <Typography variant="subtitle1" className="text-gray-800 mb-4 flex items-center font-semibold">
            <PersonOutlineIcon className="mr-2 text-gray-500" fontSize="small" />
            Bio
          </Typography>
          <TextField
            label="Bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            multiline
            rows={4}
            required
            error={Boolean(formErrors.bio)}
            helperText={formErrors.bio || "Your passion for sports and vision for the team"}
            fullWidth
            className="bg-white"
            sx={textFieldSx}
            placeholder="Tell us about yourself and your vision for the team"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ textTransform: 'none' }}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
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
