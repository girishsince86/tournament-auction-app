'use client'

import { useState, useCallback } from 'react'
import { Box, Container, Alert, Typography, Divider } from '@mui/material'
import { TeamOwnerProfileForm } from '@/components/team-owner/profile-form'
import { ProfileList } from '@/components/team-owner/profile-list'
import { Toaster } from '@/components/ui/toaster'
import { PageHeader } from '@/components/common/page-header'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        subtitle="View and manage your profile information"
      />
      
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box className="space-y-8">
          <div>
            <Typography variant="h5" className="mb-6">
              Team Owner Profile
            </Typography>
            <TeamOwnerProfileForm />
          </div>

          <Divider />

          <div>
            <Typography variant="h5" className="mb-4">
              All Profiles
            </Typography>
            <ProfileList />
          </div>
        </Box>
      </Container>
      <Toaster />
    </div>
  )
} 