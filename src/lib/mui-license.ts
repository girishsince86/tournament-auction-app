'use client';

import { LicenseInfo } from '@mui/x-data-grid-pro';

// Set MUI X License globally
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MUI_X_KEY) {
  LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_X_KEY);
} 