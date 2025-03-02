'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Chip,
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import type { TeamOwnerProfile } from '@/types/team-owner'

interface TeamOwnerProfileFormProps {
  initialData?: Partial<TeamOwnerProfile>
  onSubmit: (data: Partial<TeamOwnerProfile>) => Promise<void>
  isLoading?: boolean
}

export function TeamOwnerProfileForm({ initialData, onSubmit, isLoading }: TeamOwnerProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    profile_image_url: initialData?.profile_image_url || '',
    sports_background: initialData?.sports_background || '',
    notable_achievements: initialData?.notable_achievements || [],
    team_role: initialData?.team_role || '',
    contact_email: initialData?.contact_email || '',
    social_media: initialData?.social_media || {
      linkedin: '',
      twitter: '',
      website: ''
    },
    bio: initialData?.bio || '',
    profession: initialData?.profession || '',
    sports_interests: initialData?.sports_interests || '',
    family_impact: initialData?.family_impact || '',
    philosophy: initialData?.philosophy || ''
  })
  const [newAchievement, setNewAchievement] = useState('')

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }))
  }

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        notable_achievements: [...prev.notable_achievements, newAchievement.trim()]
      }))
      setNewAchievement('')
    }
  }

  const handleRemoveAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      notable_achievements: prev.notable_achievements.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Typography variant="h6" gutterBottom>
            {initialData ? 'Edit Profile' : 'Create Profile'}
          </Typography>

          <Stack spacing={3}>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                required
                fullWidth
              />
            </Box>

            <TextField
              label="Profile Image URL"
              value={formData.profile_image_url}
              onChange={(e) => handleChange('profile_image_url', e.target.value)}
              fullWidth
              placeholder="https://example.com/profile-image.jpg"
            />

            <TextField
              label="Team Role"
              value={formData.team_role}
              onChange={(e) => handleChange('team_role', e.target.value)}
              fullWidth
              placeholder="e.g., Team Owner, Manager, Coach"
            />

            <TextField
              label="Profession"
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              fullWidth
              placeholder="e.g., Software Engineer, Doctor, Business Owner"
            />

            <TextField
              label="Sports Background"
              value={formData.sports_background}
              onChange={(e) => handleChange('sports_background', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your sports background and experience"
            />

            <TextField
              label="Sports Interests"
              value={formData.sports_interests}
              onChange={(e) => handleChange('sports_interests', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your sports interests and activities"
            />

            <TextField
              label="Family Impact"
              value={formData.family_impact}
              onChange={(e) => handleChange('family_impact', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe how sports has impacted your family"
            />

            <TextField
              label="Philosophy"
              value={formData.philosophy}
              onChange={(e) => handleChange('philosophy', e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Share your philosophy about sports and life"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Notable Achievements
              </Typography>
              <Box className="flex gap-2 mb-2">
                <TextField
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement"
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddAchievement}
                  disabled={!newAchievement.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box className="flex flex-wrap gap-2">
                {formData.notable_achievements.map((achievement, index) => (
                  <Chip
                    key={index}
                    label={achievement}
                    onDelete={() => handleRemoveAchievement(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              required
              fullWidth
            />

            <Typography variant="subtitle1" gutterBottom>
              Social Media
            </Typography>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="LinkedIn"
                value={formData.social_media.linkedin || ''}
                onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                fullWidth
                placeholder="https://linkedin.com/in/username"
              />
              <TextField
                label="Twitter"
                value={formData.social_media.twitter || ''}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                fullWidth
                placeholder="https://twitter.com/username"
              />
              <TextField
                label="Website"
                value={formData.social_media.website || ''}
                onChange={(e) => handleSocialMediaChange('website', e.target.value)}
                fullWidth
                placeholder="https://example.com"
              />
            </Box>

            <TextField
              label="Bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Tell us about yourself"
            />

            <Box className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
} 