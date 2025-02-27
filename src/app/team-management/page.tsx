'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress } from '@mui/material'

export default function TeamManagementPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/team-management/teams')
  }, [router])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  )
} 