'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Typography, Box, Container, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'error.light',
          bgcolor: 'error.lighter',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 64 }} />
          
          <Typography variant="h4" component="h1" color="error.dark" gutterBottom>
            Something went wrong!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            We apologize for the inconvenience. The application encountered an unexpected error.
          </Typography>
          
          {error.message && (
            <Typography 
              variant="body2" 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                width: '100%',
                maxWidth: 'md',
                overflowX: 'auto',
                fontFamily: 'monospace'
              }}
            >
              {error.message}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={reset}
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              component={Link}
              href="/"
              startIcon={<HomeIcon />}
            >
              Return Home
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            If this problem persists, please contact support with error reference: {error.digest}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 