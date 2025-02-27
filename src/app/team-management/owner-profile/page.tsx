'use client'

import { useState, useCallback } from 'react'
import { Box, Container, Alert } from '@mui/material'
import { TeamOwnerProfileForm } from '../components/team-owner-profile'
import type { TeamOwnerProfile, TeamOwnerProfileUpdateInput } from '@/types/team-owner'
import { useRouter } from 'next/navigation'

export default function TeamOwnerProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<TeamOwnerProfile | undefined>(undefined)

  const handleSave = useCallback(async (data: TeamOwnerProfileUpdateInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/team-management/owner-profile', {
        method: profile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const savedProfile = await response.json()
      setProfile(savedProfile)
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }, [profile, router])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <TeamOwnerProfileForm
        profile={profile}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </Container>
  )
} 