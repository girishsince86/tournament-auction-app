import { createTheme } from '@mui/material/styles'
import { Poppins, DM_Sans } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

/** Sports/broadcast palette for public tournament pages */
const sportsPalette = {
  surface: {
    dark: '#0a0e17',
    card: '#111827',
    elevated: '#1a2234',
  },
  accent: {
    blue: '#0ea5e9',
    blueBright: '#38bdf8',
    blueDark: '#0284c7',
  },
  highlight: {
    orange: '#f97316',
    gold: '#eab308',
  },
  live: { red: '#ef4444' },
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: sportsPalette.accent.blue,
      light: sportsPalette.accent.blueBright,
      dark: sportsPalette.accent.blueDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: sportsPalette.highlight.orange,
      light: '#fb923c',
      dark: '#ea580c',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      disabled: '#9ca3af',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: poppins.style.fontFamily,
    h1: {
      fontFamily: dmSans.style.fontFamily,
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: dmSans.style.fontFamily,
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: dmSans.style.fontFamily,
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: dmSans.style.fontFamily,
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: dmSans.style.fontFamily,
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontFamily: dmSans.style.fontFamily,
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.57,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.75,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
}) 