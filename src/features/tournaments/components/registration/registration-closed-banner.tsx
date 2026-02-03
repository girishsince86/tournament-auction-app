import { Box, Typography, Paper, Stack } from '@mui/material';
import Image from 'next/image';

export function RegistrationClosedBanner() {
  return (
    <Stack spacing={2}>
      {/* Status Banner */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: 'black',
          color: 'white',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          borderBottom: '2px solid #FFD700',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#FFD700', // Gold color
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Registration Window Closed
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#FFF',
            opacity: 0.9,
            mt: 1
          }}
        >
          The registration period for this tournament has ended. Thank you for your interest!
        </Typography>
      </Paper>

      {/* Tournament Announcement Image */}
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'black',
          borderRadius: 2,
        }}
      >
        <Box sx={{ width: '100%', height: 'auto', minHeight: '600px', position: 'relative' }}>
          <Image
            src="/tournament-announcement.jpg"
            alt="PBEL City Volleyball & Throwball League 2026"
            fill
            style={{ 
              objectFit: 'contain',
              objectPosition: 'center',
              width: '100%',
              height: '100%'
            }}
            sizes="100vw"
            quality={100}
            priority
          />
        </Box>
      </Paper>
    </Stack>
  );
} 