'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  Grid,
  Chip,
} from '@mui/material'
import {
  PhotoCamera as CameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Height as HeightIcon,
  SportsVolleyball as VolleyballIcon,
  EmojiEvents as SkillIcon,
  Numbers as JerseyIcon,
} from '@mui/icons-material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TournamentRegistration } from '@/features/tournaments/types/registration'
import toast from 'react-hot-toast'
import { compressImage } from '@/lib/utils/image-compression'

interface Props {
  params: {
    token: string
  }
}

const CATEGORY_MAP = {
  'VOLLEYBALL_OPEN_MEN': 'Volleyball - Open',
  'THROWBALL_WOMEN': 'Throwball - Women',
  'THROWBALL_13_17_MIXED': 'Throwball - 13-17 Mixed',
  'THROWBALL_8_12_MIXED': 'Throwball - 8-12 Mixed',
} as const;

const SKILL_LEVEL_MAP = {
  'RECREATIONAL_C': 'Recreational (C)',
  'INTERMEDIATE_B': 'Intermediate (B)',
  'UPPER_INTERMEDIATE_BB': 'Upper Intermediate (BB)',
  'COMPETITIVE_A': 'Competitive (A)',
} as const;

export default function PlayerProfilePage({ params }: Props) {
  const [player, setPlayer] = useState<TournamentRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()
  const router = useRouter()
  const supabase = createClientComponentClient({
    options: {
      db: {
        schema: 'public'
      }
    }
  })

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/profile/${params.token}`)
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setPlayer(data.player)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [params.token])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleDeleteImage = useCallback(async () => {
    if (!player?.profile_image_url) {
      toast.error('No image to delete')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // First, update the profile to remove the image URL
      const response = await fetch(`/api/profile/${params.token}/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: player.profile_image_url 
        }),
      })

      const responseData = await response.json()
      console.log('Profile update response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update profile')
      }

      await fetchProfile()
      toast.success('Profile image deleted successfully')
    } catch (err) {
      console.error('Delete image error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [player, params.token, fetchProfile])

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !player) {
        toast.error('Please select an image to upload')
        return
      }

      setUploading(true)
      setError(null)
      const file = event.target.files[0]
      event.target.value = '' // Reset input

      // Log original file details
      console.log('Original image details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      })

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB')
      }

      console.log('Starting image compression...')
      // Compress image
      const compressedFile = await compressImage(file, {
        maxWidthOrHeight: 800,
        quality: 0.8
      })

      // Log compression results
      console.log('Compression results:', {
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        compressionRatio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`,
      })

      // Upload to Supabase Storage
      const fileExt = 'jpg' // We're converting all images to JPEG
      const filePath = `profile-images/${player.id}-${Date.now()}.${fileExt}`
      console.log('Uploading compressed image to:', filePath)

      try {
        console.log('Starting upload via API...')

        // Create FormData
        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('filePath', filePath)
        formData.append('originalSize', String(file.size))
        formData.append('compressedSize', String(compressedFile.size))

        const maxRetries = 3;
        let currentRetry = 0;

        while (currentRetry < maxRetries) {
          try {
            console.log(`Attempt ${currentRetry + 1} of ${maxRetries}...`);
            
            // Upload via API route
            const response = await fetch(`/api/profile/${params.token}/image`, {
              method: 'POST',
              body: formData,
            })

            const responseData = await response.json()
            console.log('Upload response:', responseData)

            if (!response.ok) {
              throw new Error(responseData.error || 'Failed to upload image')
            }

            if (!responseData.imageUrl) {
              throw new Error('No image URL returned')
            }

            await fetchProfile()
            toast.success('Profile image uploaded successfully')
            break;
          } catch (err) {
            console.error('Upload error:', err)
            
            // If this is the last retry, throw the error
            if (currentRetry === maxRetries - 1) {
              throw err
            }
            
            // Otherwise, continue to next retry
            currentRetry++;
            continue;
          }
        }
      } catch (err) {
        console.error('Upload process error:', err)
        throw new Error(err instanceof Error ? err.message : 'Failed during upload process')
      }
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [player, params.token, fetchProfile])

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !player) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Profile not found'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
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
          Player Profile
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column - Profile Image */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Profile Image */}
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
                {player.profile_image_url ? (
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
                        src={player.profile_image_url}
                        alt={`${player.first_name} ${player.last_name}`}
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

              {/* Upload Button - Only show if no image exists */}
              {!player.profile_image_url && (
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
                      sx={{
                        position: 'relative',
                        '&.Mui-disabled': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          opacity: 0.7,
                        },
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Profile Image'}
                    </Button>
                  </label>
                  {uploading && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      Please wait while we process your image...
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Player Details */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Basic Info Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {player.first_name} {player.last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        <EmailIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Email
                      </Typography>
                      <Typography>{player.email}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Phone
                      </Typography>
                      <Typography>{player.phone_number}</Typography>
                    </Stack>
                  </Grid>
                  {player.flat_number && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <HomeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Flat Number
                        </Typography>
                        <Typography>{player.flat_number}</Typography>
                      </Stack>
                    </Grid>
                  )}
                  {player.height && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <HeightIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Height
                        </Typography>
                        <Typography>
                          {(() => {
                            const heightInM = typeof player.height === 'string' 
                              ? parseFloat(player.height) 
                              : player.height;
                            const heightInCm = Math.round(heightInM * 100);
                            return `${heightInCm} cm`;
                          })()}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider />

              {/* Sports Info Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VolleyballIcon fontSize="small" />
                  Sports Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Chip
                      label={CATEGORY_MAP[player.registration_category as keyof typeof CATEGORY_MAP] || player.registration_category}
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  </Grid>
                  {player.skill_level && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <SkillIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Skill Level
                        </Typography>
                        <Typography>
                          {SKILL_LEVEL_MAP[player.skill_level as keyof typeof SKILL_LEVEL_MAP] || player.skill_level}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                  {player.playing_positions && player.playing_positions.length > 0 && (
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <VolleyballIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Playing Positions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {player.playing_positions.map((position) => (
                            <Chip
                              key={position}
                              label={position}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider />

              {/* Jersey Info Section */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <JerseyIcon fontSize="small" />
                  Jersey Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Jersey Size
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {player.tshirt_size}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Jersey Number
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {player.tshirt_number}
                      </Typography>
                    </Stack>
                  </Grid>
                  {player.tshirt_name && (
                    <Grid item xs={12}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Name on Jersey
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {player.tshirt_name}
                        </Typography>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
} 