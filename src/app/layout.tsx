import '@/styles/globals.css'
import { Poppins, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ThemeRegistry } from '@/components/theme-registry'
import { AuthProvider } from '@/features/auth/context/auth-context'

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
  return (
    <html lang="en" suppressHydrationWarning className={cn(
      poppins.variable,
      dmSans.variable,
      jetbrainsMono.variable,
    )}>
      <body suppressHydrationWarning className={cn(
        'min-h-screen',
        'bg-background-primary',
        'text-text-primary',
        'antialiased',
        'font-body'
      )}>
        <ThemeRegistry>
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
        </ThemeRegistry>
      </body>
    </html>
  )
} 