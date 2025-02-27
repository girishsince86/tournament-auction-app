'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Person as PersonIcon,
  Camera as CameraIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { compressImage } from '@/lib/utils/image-compression'
import type { TeamOwnerProfile, TeamOwnerProfileUpdateInput } from '@/types/team-owner'

const socialMediaSchema = z.object({
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
})

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  sports_background: z.string().min(1, 'Sports background is required'),
  notable_achievements: z.array(z.string()),
  team_role: z.string().min(1, 'Team role is required'),
  contact_email: z.string().email().optional(),
  social_media: socialMediaSchema,
  bio: z.string().min(50, 'Bio should be at least 50 characters'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface Props {
  profile?: TeamOwnerProfile
  onSave: (data: TeamOwnerProfileUpdateInput) => Promise<void>
  isLoading?: boolean
}

export function TeamOwnerProfileForm({ profile, onSave, isLoading = false }: Props) {
  const theme = useTheme()
  const [uploading, setUploading] = useState(false)
  const [achievement, setAchievement] = useState('')

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      sports_background: profile?.sports_background || '',
      notable_achievements: profile?.notable_achievements || [],
      team_role: profile?.team_role || '',
      contact_email: profile?.contact_email || '',
      social_media: profile?.social_media || {},
      bio: profile?.bio || '',
    },
  })

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        toast.error('Please select an image to upload')
        return
      }

      setUploading(true)
      const file = event.target.files[0]
      event.target.value = ''

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB')
      }

      const compressedFile = await compressImage(file, {
        maxWidthOrHeight: 800,
        quality: 0.8,
      })

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('filePath', `team-owner-images/${profile?.id || 'new'}-${Date.now()}.jpg`)

      const response = await fetch('/api/team-management/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      await onSave({ profile_image_url: data.imageUrl })
      toast.success('Profile image uploaded successfully')
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [profile?.id, onSave])

  const handleDeleteImage = useCallback(async () => {
    try {
      setUploading(true)
      await onSave({ profile_image_url: undefined })
      toast.success('Profile image deleted successfully')
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete image')
    } finally {
      setUploading(false)
    }
  }, [onSave])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await onSave(data)
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to update profile')
    }
  }

  const handleAddAchievement = () => {
    if (!achievement.trim()) return
    const current = watch('notable_achievements')
    setValue('notable_achievements', [...current, achievement.trim()])
    setAchievement('')
  }

  const handleRemoveAchievement = (index: number) => {
    const current = watch('notable_achievements')
    setValue(
      'notable_achievements',
      current.filter((_, i) => i !== index)
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Team Owner Profile
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          {/* Left Column - Profile Image */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Box
                sx={{
                  width: '100%',
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  border: `2px dashed ${theme.palette.divider}`,
                }}
              >
                {profile?.profile_image_url ? (
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '1',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={profile.profile_image_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteImage}
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : null}
                        fullWidth
                      >
                        {uploading ? 'Deleting...' : 'Delete Image'}
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      textAlign: 'center',
                    }}
                  >
                    <CameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No profile image uploaded yet
                    </Typography>
                  </Box>
                )}
              </Box>

              {!profile?.profile_image_url && (
                <Box sx={{ textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={uploading ? <CircularProgress size={20} /> : <CameraIcon />}
                      disabled={uploading}
                      fullWidth
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </label>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Profile Details */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First Name"
                        fullWidth
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last Name"
                        fullWidth
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Controller
                name="sports_background"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sports Background"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.sports_background}
                    helperText={errors.sports_background?.message}
                  />
                )}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Notable Achievements
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      value={achievement}
                      onChange={(e) => setAchievement(e.target.value)}
                      placeholder="Add an achievement"
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      onClick={handleAddAchievement}
                      color="primary"
                      sx={{ flexShrink: 0 }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {watch('notable_achievements').map((achievement, index) => (
                      <Chip
                        key={index}
                        label={achievement}
                        onDelete={() => handleRemoveAchievement(index)}
                      />
                    ))}
                  </Box>
                </Stack>
              </Box>

              <Controller
                name="team_role"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Team Role"
                    fullWidth
                    error={!!errors.team_role}
                    helperText={errors.team_role?.message}
                  />
                )}
              />

              <Controller
                name="contact_email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Email (Optional)"
                    type="email"
                    fullWidth
                    error={!!errors.contact_email}
                    helperText={errors.contact_email?.message}
                  />
                )}
              />

              <Typography variant="subtitle2">Social Media Links (Optional)</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="social_media.linkedin"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="LinkedIn"
                        fullWidth
                        error={!!errors.social_media?.linkedin}
                        helperText={errors.social_media?.linkedin?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="social_media.twitter"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Twitter"
                        fullWidth
                        error={!!errors.social_media?.twitter}
                        helperText={errors.social_media?.twitter?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="social_media.instagram"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Instagram"
                        fullWidth
                        error={!!errors.social_media?.instagram}
                        helperText={errors.social_media?.instagram?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bio"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.bio}
                    helperText={errors.bio?.message}
                  />
                )}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
} 