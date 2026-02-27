'use client'

import { useState, useEffect } from 'react'
import { useTeamOwnerProfile } from '@/hooks/use-team-owner'
import { TeamOwnerProfile, TeamOwnerUpdateRequest } from '@/types/team-owner'
import { TextField, Button, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, IconButton, Box } from '@mui/material'
import { useToast } from '@/components/ui/use-toast'
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import Image from 'next/image'
import EmailIcon from '@mui/icons-material/Email'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

// Force light-mode colors on all MUI fields (MUI dark theme overrides Tailwind classes)
const fieldSx = {
  '& .MuiInputBase-root': {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
  },
  '& .MuiInputBase-input': { color: '#1f2937' },
  '& .MuiInputLabel-root': { color: '#6b7280' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1E40AF' },
  '& .MuiFormHelperText-root': { color: '#9ca3af' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#d1d5db' },
    '&:hover fieldset': { borderColor: '#93c5fd' },
    '&.Mui-focused fieldset': { borderColor: '#1E40AF' },
  },
}

// Section header style
const sectionHeaderSx = {
  color: '#1e3a5f',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 2.5,
}

const sectionIconSx = { color: '#1E40AF', fontSize: 20 }

export function TeamOwnerProfileForm() {
  const { profile, fetchProfile, createProfile, updateProfile, handleImageUpload, handleImageDelete } = useTeamOwnerProfile()
  const { toast } = useToast()

  // Auto-load existing profile on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])
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
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        bgcolor: '#ffffff',
      }}
    >
      {/* Header banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1E40AF 100%)',
          px: 4,
          py: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <SportsVolleyballIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {isEditing ? 'Edit Profile' : 'Create Profile'}
        </Typography>
      </Box>

      {/* Subtitle */}
      <Box sx={{ px: 4, pt: 2.5, pb: 1 }}>
        <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
          Your profile establishes your team&apos;s presence in the tournament.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Profile Image */}
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={sectionHeaderSx}>
              <CameraAltIcon sx={sectionIconSx} />
              Profile Image
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box className="relative group" sx={{ flexShrink: 0 }}>
                <div className="relative w-24 h-24 rounded-full overflow-hidden" style={{ border: '3px solid #e2e8f0' }}>
                  {previewUrl ? (
                    <>
                      <Image src={previewUrl} alt="Profile" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={handleDeleteImageClick}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors focus:outline-none"
                        title="Delete"
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#eef2ff' }}>
                      <PersonIcon sx={{ color: '#a5b4fc', fontSize: 36 }} />
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
                    className="cursor-pointer rounded-full transition-colors"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px' }}
                  >
                    <CameraAltIcon sx={{ color: '#fff', fontSize: 18 }} />
                  </label>
                </div>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                  Upload a professional photo
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  Square image, at least 400x400px
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Personal Information */}
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={sectionHeaderSx}>
              <PersonIcon sx={sectionIconSx} />
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="First Name"
                name="first_name"
                variant="outlined"
                size="small"
                value={formData.first_name}
                onChange={handleChange}
                required
                error={Boolean(formErrors.first_name)}
                helperText={formErrors.first_name}
                sx={fieldSx}
              />
              <TextField
                label="Last Name"
                name="last_name"
                variant="outlined"
                size="small"
                value={formData.last_name}
                onChange={handleChange}
                required
                error={Boolean(formErrors.last_name)}
                helperText={formErrors.last_name}
                sx={fieldSx}
              />
            </Box>
          </Box>

          {/* Contact Information */}
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={sectionHeaderSx}>
              <EmailIcon sx={sectionIconSx} />
              Contact Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Contact Email"
                name="contact_email"
                type="email"
                variant="outlined"
                size="small"
                value={formData.contact_email}
                onChange={handleChange}
                required
                error={Boolean(formErrors.contact_email)}
                helperText={formErrors.contact_email}
                sx={fieldSx}
              />
              <TextField
                label="Phone Number"
                name="phone_number"
                type="tel"
                variant="outlined"
                size="small"
                value={formData.phone_number || ''}
                onChange={handleChange}
                placeholder="9876543210"
                error={Boolean(formErrors.phone_number)}
                helperText={formErrors.phone_number || '10-digit Indian mobile number'}
                inputProps={{ maxLength: 10, pattern: '[6-9][0-9]{9}' }}
                sx={fieldSx}
              />
            </Box>
          </Box>

          {/* Sports Profile */}
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={sectionHeaderSx}>
              <EmojiEventsIcon sx={sectionIconSx} />
              Sports Profile
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Sports Background"
                name="sports_background"
                variant="outlined"
                value={formData.sports_background || ''}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Your experience in sports — coaching, playing, or management roles"
                sx={fieldSx}
              />
              <TextField
                label="Notable Achievements"
                name="notable_achievements"
                variant="outlined"
                value={formData.notable_achievements?.join('\n') || ''}
                onChange={handleChange}
                multiline
                minRows={3}
                maxRows={6}
                fullWidth
                placeholder="List achievements, one per line"
                helperText="Press Enter for each new achievement"
                sx={fieldSx}
              />
            </Box>
          </Box>

          {/* Bio */}
          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={sectionHeaderSx}>
              <PersonOutlineIcon sx={sectionIconSx} />
              Bio
            </Typography>
            <TextField
              label="Bio"
              name="bio"
              variant="outlined"
              value={formData.bio || ''}
              onChange={handleChange}
              multiline
              rows={4}
              required
              error={Boolean(formErrors.bio)}
              helperText={formErrors.bio || 'Your passion for sports and vision for the team'}
              fullWidth
              placeholder="Tell us about yourself and your vision for the team"
              sx={fieldSx}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                textTransform: 'none',
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                bgcolor: '#1E40AF',
                '&:hover': { bgcolor: '#1e3a8a' },
                px: 4,
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </Button>
          </Box>
        </Box>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle sx={{ color: '#1f2937' }}>
          {dialogType === 'cancel' ? 'Discard Changes?' : 'Delete Profile Image?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#6b7280' }}>
            {dialogType === 'cancel'
              ? 'Are you sure you want to discard your changes? This action cannot be undone.'
              : 'Are you sure you want to delete your profile image? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} sx={{ color: '#6b7280', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={dialogType === 'cancel' ? handleConfirmCancel : handleConfirmDelete}
            sx={{ color: '#1E40AF', textTransform: 'none', fontWeight: 600 }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
