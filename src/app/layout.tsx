'use client'

import '@/styles/globals.css'
import { Poppins, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from '@/lib/theme'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // During static page generation, render without auth
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return (
      <html lang="en" className={cn(
        poppins.variable,
        dmSans.variable,
        jetbrainsMono.variable,
      )}>
        <body className={cn(
          'min-h-screen',
          'bg-background-primary',
          'text-text-primary',
          'antialiased',
          'font-body'
        )}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <main className="min-h-screen">
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" className={cn(
      poppins.variable,
      dmSans.variable,
      jetbrainsMono.variable,
    )}>
      <body className={cn(
        'min-h-screen',
        'bg-background-primary',
        'text-text-primary',
        'antialiased',
        'font-body'
      )}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'bg-background-secondary text-text-primary',
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 