import { createTheme, alpha } from '@mui/material/styles'
import { colors } from '@/styles/theme/colors'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[300],
      light: colors.secondary[200],
      dark: colors.secondary[400],
      contrastText: '#ffffff',
    },
    background: {
      default: colors.background.primary,
      paper: colors.background.secondary,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    error: {
      main: colors.status.error,
    },
    warning: {
      main: colors.status.warning,
    },
    info: {
      main: colors.status.info,
    },
    success: {
      main: colors.status.success,
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: 'var(--font-dm-sans)',
    h1: {
      fontFamily: 'var(--font-poppins)',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'var(--font-poppins)',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'var(--font-poppins)',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'var(--font-poppins)',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: 'var(--font-poppins)',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'var(--font-poppins)',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.08)',
    '0px 2px 4px rgba(15, 23, 42, 0.08)',
    '0px 4px 8px rgba(15, 23, 42, 0.08)',
    '0px 6px 12px rgba(15, 23, 42, 0.08)',
    '0px 8px 16px rgba(15, 23, 42, 0.08)',
    '0px 12px 24px rgba(15, 23, 42, 0.08)',
    '0px 16px 32px rgba(15, 23, 42, 0.08)',
    '0px 20px 40px rgba(15, 23, 42, 0.08)',
    '0px 24px 48px rgba(15, 23, 42, 0.08)',
    '0px 28px 56px rgba(15, 23, 42, 0.08)',
    '0px 32px 64px rgba(15, 23, 42, 0.08)',
    '0px 36px 72px rgba(15, 23, 42, 0.08)',
    '0px 40px 80px rgba(15, 23, 42, 0.08)',
    '0px 44px 88px rgba(15, 23, 42, 0.08)',
    '0px 48px 96px rgba(15, 23, 42, 0.08)',
    '0px 52px 104px rgba(15, 23, 42, 0.08)',
    '0px 56px 112px rgba(15, 23, 42, 0.08)',
    '0px 60px 120px rgba(15, 23, 42, 0.08)',
    '0px 64px 128px rgba(15, 23, 42, 0.08)',
    '0px 68px 136px rgba(15, 23, 42, 0.08)',
    '0px 72px 144px rgba(15, 23, 42, 0.08)',
    '0px 76px 152px rgba(15, 23, 42, 0.08)',
    '0px 80px 160px rgba(15, 23, 42, 0.08)',
    '0px 84px 168px rgba(15, 23, 42, 0.08)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.primary,
          color: colors.text.primary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          borderColor: alpha('#000', 0.08),
          backgroundColor: '#ffffff',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            borderColor: alpha('#000', 0.12),
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '24px 32px',
          backgroundColor: alpha('#000', 0.02),
          borderBottom: `1px solid ${alpha('#000', 0.08)}`,
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 600,
          color: colors.text.primary,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '32px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.08)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(15, 23, 42, 0.12)',
            transform: 'translateY(-1px)',
          },
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1.125rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: alpha('#000', 0.24),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(colors.primary[500], 0.12)}`,
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiFormHelperText-root': {
            marginTop: '6px',
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha('#000', 0.24),
          },
        },
        input: {
          padding: '12px 16px',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          padding: '12px 16px',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: alpha('#000', 0.24),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(colors.primary[500], 0.12)}`,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        filled: {
          fontWeight: 500,
        },
      },
    },
  },
}) 