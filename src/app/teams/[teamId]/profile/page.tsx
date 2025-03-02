import { Card, CardContent, Typography, Avatar, Box, Grid, Chip, Stack, Button } from '@mui/material'
import { getTeamById } from '@/lib/api/teams'
import { getTeamOwnerProfile } from '@/lib/api/team-owners'
import { PageHeader } from '@/components/common/page-header'
import { redirect } from 'next/navigation'
import { getAllTeams } from '@/lib/api/teams'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types/supabase'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import LanguageIcon from '@mui/icons-material/Language'
import { TeamOwnerProfileForm } from '@/features/team-management/components/profile/TeamOwnerProfileForm'
import EditIcon from '@mui/icons-material/Edit'

interface TeamOwnerProfilePageProps {
  params: {
    teamId: string
  }
}

export default async function TeamOwnerProfilePage({ params }: TeamOwnerProfilePageProps) {
  const cookieStore = cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Handle 'all' teams view
  if (params.teamId === 'all') {
    const teams = await getAllTeams()
    console.log('Fetched teams:', teams)
    
    if (!teams?.length) {
      return (
        <div className="p-4">
          <Typography variant="h6" color="error">
            No teams found in the database
          </Typography>
        </div>
      )
    }

    // Fetch all team owner profiles in parallel
    const teamOwnerProfiles = await Promise.all(
      teams.map(async (team) => {
        const ownerProfile = await getTeamOwnerProfile(team.user_id)
        console.log(`Team ${team.id} owner profile:`, ownerProfile)
        if (!ownerProfile) return null
        return { team, ownerProfile }
      })
    )

    const validProfiles = teamOwnerProfiles.filter((item): item is { team: any; ownerProfile: any } => item !== null)
    console.log('Valid profiles:', validProfiles)

    return (
      <div className="p-4 space-y-6">
        <PageHeader title="Team Owner Profiles" />
        
        <Grid container spacing={3}>
          {validProfiles.map(({ team, ownerProfile }) => (
            <Grid item xs={12} md={6} key={team.id}>
              <Card>
                <CardContent className="space-y-4">
                  <Box className="flex items-center space-x-4">
                    <Avatar
                      src={ownerProfile.profile_image_url}
                      alt={`${ownerProfile.first_name} ${ownerProfile.last_name}`}
                      sx={{ width: 60, height: 60 }}
                    />
                    <div>
                      <Typography variant="h6" component="h2">
                        {ownerProfile.first_name} {ownerProfile.last_name}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {team.name} - {ownerProfile.team_role}
                      </Typography>
                    </div>
                  </Box>

                  <div>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sports Background
                    </Typography>
                    <Typography variant="body2">
                      {ownerProfile.sports_background}
                    </Typography>
                  </div>

                  {ownerProfile.notable_achievements.length > 0 && (
                    <div>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notable Achievements
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {ownerProfile.notable_achievements.map((achievement: string, index: number) => (
                          <Chip key={index} label={achievement} size="small" />
                        ))}
                      </Stack>
                    </div>
                  )}

                  <div>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contact
                    </Typography>
                    {ownerProfile.contact_email && (
                      <Typography variant="body2">
                        {ownerProfile.contact_email}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} mt={1}>
                      {ownerProfile.social_media && ownerProfile.social_media.linkedin && (
                        <LinkedInIcon fontSize="small" />
                      )}
                      {ownerProfile.social_media && ownerProfile.social_media.twitter && (
                        <TwitterIcon fontSize="small" />
                      )}
                      {ownerProfile.social_media && ownerProfile.social_media.website && (
                        <LanguageIcon fontSize="small" />
                      )}
                    </Stack>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    )
  }

  // Single team owner profile view
  const team = await getTeamById(params.teamId)
  if (!team) {
    return (
      <div className="p-4">
        <Typography variant="h6" color="error">
          Team not found
        </Typography>
      </div>
    )
  }

  const ownerProfile = await getTeamOwnerProfile(team.user_id)
  const isOwnProfile = session.user.id === team.user_id

  // If it's the owner's profile and no profile exists, redirect to create page
  if (isOwnProfile && !ownerProfile) {
    redirect(`/teams/${params.teamId}/profile/create`)
  }

  if (!ownerProfile) {
    return (
      <div className="p-4">
        <Typography variant="h6" color="error">
          Team owner profile not found
        </Typography>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <Box className="flex justify-between items-start">
        <PageHeader title="Team Owner Profile" />
        {isOwnProfile && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            href={`/teams/${team.id}/profile/edit`}
          >
            Edit Profile
          </Button>
        )}
      </Box>
      
      <Card className="max-w-2xl mx-auto">
        <CardContent className="space-y-6">
          <Box className="flex items-center space-x-4">
            <Avatar
              src={ownerProfile.profile_image_url}
              alt={`${ownerProfile.first_name} ${ownerProfile.last_name}`}
              sx={{ width: 80, height: 80 }}
            />
            <div>
              <Typography variant="h5" component="h2">
                {ownerProfile.first_name} {ownerProfile.last_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {team.name} - {ownerProfile.team_role}
              </Typography>
            </div>
          </Box>

          <div>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sports Background
            </Typography>
            <Typography variant="body1">
              {ownerProfile.sports_background}
            </Typography>
          </div>

          {ownerProfile.notable_achievements && ownerProfile.notable_achievements.length > 0 && (
            <div>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notable Achievements
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {ownerProfile.notable_achievements.map((achievement: string, index: number) => (
                  <Chip key={index} label={achievement} size="small" />
                ))}
              </Stack>
            </div>
          )}

          <div>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Bio
            </Typography>
            <Typography variant="body1">
              {ownerProfile.bio}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contact Information
            </Typography>
            {ownerProfile.contact_email && (
              <Typography variant="body1">
                {ownerProfile.contact_email}
              </Typography>
            )}
            <Stack direction="row" spacing={2} mt={1}>
              {ownerProfile.social_media && ownerProfile.social_media.linkedin && (
                <LinkedInIcon />
              )}
              {ownerProfile.social_media && ownerProfile.social_media.twitter && (
                <TwitterIcon />
              )}
              {ownerProfile.social_media && ownerProfile.social_media.website && (
                <LanguageIcon />
              )}
            </Stack>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 