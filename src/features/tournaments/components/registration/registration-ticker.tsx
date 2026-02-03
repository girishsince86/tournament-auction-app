'use client'

import { Box, Typography, useTheme, alpha } from '@mui/material'
import { REGISTRATION_CATEGORIES } from './registration-constants'

const TICKER_ITEMS = [
  'PBEL City Volleyball & Throwball League 2026',
  'Bringing Our Community Together Through Sports',
  ...REGISTRATION_CATEGORIES.map((c) => c.label),
  'Registration fee: INR 750',
  'Volleyball: teams formed through auction • One category per player',
]

const separator = '  ◆  '

export function RegistrationTicker() {
  const theme = useTheme()

  const content = [...TICKER_ITEMS, ...TICKER_ITEMS]
    .map((text) => text + separator)
    .join('')

  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden',
        py: 1.5,
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
        backgroundColor: alpha(theme.palette.primary.dark, 0.5),
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'inline-block',
          paddingLeft: '100%',
          animation: 'registration-ticker 50s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: 'var(--font-sports-display), Oswald, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: alpha(theme.palette.common.white, 0.95),
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
          }}
        >
          {content}
        </Typography>
      </Box>
    </Box>
  )
}
