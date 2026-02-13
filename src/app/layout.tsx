import '@/styles/globals.css'
import { Poppins, DM_Sans, JetBrains_Mono, Oswald } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ThemeRegistry } from '@/components/theme-registry'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { PoweredByJulley } from '@/components/public/PoweredByJulley'

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

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sports-display',
})

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      oswald.variable,
    )}>
      <body suppressHydrationWarning className={cn(
        'min-h-screen',
        'antialiased',
        'font-body'
      )}>
        <ThemeRegistry>
          <AuthProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <PoweredByJulley standalone />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a2234',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                },
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
} 