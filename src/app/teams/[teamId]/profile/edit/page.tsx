'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { TeamOwnerProfileForm } from '@/features/team-management/components/profile/TeamOwnerProfileForm'
import type { TeamOwnerProfile } from '@/lib/api/team-owners'
import { Typography } from '@mui/material'
import { toast } from 'react-hot-toast'

export default function EditTeamOwnerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<TeamOwnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/team-owner-profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      setError('Failed to load profile')
      console.error('Error fetching profile:', error)
    }
  }

  const handleSubmit = async (data: Partial<TeamOwnerProfile>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/team-owner-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      toast.success('Profile updated successfully')
      router.push(`/teams/${profile?.id}/profile`)
      router.refresh()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-4">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <PageHeader 
        title="Edit Your Profile" 
        subtitle="Update your profile information visible to other team owners."
      />
      <div className="max-w-3xl mx-auto">
        <TeamOwnerProfileForm
          initialData={profile || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 