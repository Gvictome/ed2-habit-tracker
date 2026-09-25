import type { Metadata, Viewport } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

// Self-hosted by next/font: no request to Google at runtime, no layout shift.
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Streakly - build habits that stick', template: '%s · Streakly' },
  description:
    'Track habits, log measurements, set goals with deadlines, and earn milestones. A habit tracker that shows you the progress you are actually making.',
  applicationName: 'Streakly',
  appleWebApp: { capable: true, title: 'Streakly', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#07080b' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // next-themes writes the theme class before paint; suppress the expected attribute mismatch.
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
