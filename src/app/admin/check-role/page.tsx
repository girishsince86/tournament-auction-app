'use client';

import { Box, Typography } from '@mui/material';

export default function CheckRolePage() {
  return (
    <Box p={4}>
      <Typography variant="h4">Role Check</Typography>
      <Typography variant="body1" mt={2}>
        This page is used to verify user roles and permissions.
      </Typography>
    </Box>
  );
} 