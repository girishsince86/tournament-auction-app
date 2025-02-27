import { TeamOwnerProfileForm } from '@/components/team-owner/profile-form'
import { ProfileList } from '@/components/team-owner/profile-list'
import { Toaster } from '@/components/ui/toaster'
import { Box, Typography, Divider } from '@mui/material'

export default function TeamOwnerProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <Box className="space-y-8">
        <div>
          <Typography variant="h4" className="mb-6">
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
      <Toaster />
    </div>
  )
} 