import { TeamOwnerProfileForm } from '@/components/team-owner/profile-form'
import { ProfileList } from '@/components/team-owner/profile-list'
import { Toaster } from '@/components/ui/toaster'
import { Box, Divider } from '@mui/material'

export default function TeamOwnerProfilePage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-8">
      <TeamOwnerProfileForm />
      <Divider />
      <ProfileList />
      <Toaster />
    </div>
  )
}
