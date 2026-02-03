'use client'

import { Box, Typography } from '@mui/material'
import Image from 'next/image'

interface PoweredByJulleyProps {
  /** When true, render as a full footer strip (for root layout). When false, just the content (for use inside another footer). */
  standalone?: boolean
}

export function PoweredByJulley({ standalone = false }: PoweredByJulleyProps) {
  const content = (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Powered by
      </Typography>
      <Box sx={{ position: 'relative', width: 32, height: 32 }}>
        <Image
          src="/images/julley-online-logo.jpeg"
          alt="Julley Online"
          width={32}
          height={32}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Julley Online Pvt Ltd
      </Typography>
    </>
  )

  if (standalone) {
    return (
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          bgcolor: 'grey.100',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {content}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
      {content}
    </Box>
  )
}
