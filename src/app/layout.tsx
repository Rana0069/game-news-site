import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '../styles/globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: { default: 'GamePulse — Your Ultimate Gaming Destination', template: '%s | GamePulse' },
  description: 'GamePulse is your #1 source for gaming news, reviews, guides, and more.',
  keywords: ['gaming news', 'game reviews', 'esports', 'PC games', 'PlayStation', 'Xbox', 'Nintendo'],
  openGraph: {
    type: 'website',
    siteName: 'GamePulse',
    images: ['/og-default.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@gamepulse',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} bg-dark-950 text-gray-100 antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
