'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/common/page-header'
import { TeamOwnerProfileForm } from '@/features/team-management/components/profile/TeamOwnerProfileForm'
import type { TeamOwnerProfile } from '@/lib/api/team-owners'
import { toast } from 'react-hot-toast'

export default function CreateTeamOwnerProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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

      toast.success('Profile created successfully')
      router.back()
      router.refresh()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <PageHeader 
        title="Create Your Profile" 
        subtitle="Tell other team owners about yourself and your sports background."
      />
      <div className="max-w-3xl mx-auto">
        <TeamOwnerProfileForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 