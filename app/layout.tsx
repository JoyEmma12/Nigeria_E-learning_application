import type { Metadata, Viewport } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ndukaagu - Learn Nigerian Languages',
  description: 'Master indigenous Nigerian languages with AI-powered personalized learning, engaging lessons, and gamification. Learn Igbo, Yoruba, Hausa, Ibibio, and Efik.',
  keywords: ['Nigerian languages', 'language learning', 'Igbo', 'Yoruba', 'Hausa', 'education', 'AI learning'],
  authors: [{ name: 'Ndukaagu Team' }],
  creator: 'Ndukaagu',
  publisher: 'Ndukaagu',
  robots: 'index, follow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ndukaagu',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://ndukaagu.vercel.app',
    title: 'Ndukaagu - Learn Nigerian Languages',
    description: 'Master indigenous Nigerian languages with AI-powered personalized learning',
    siteName: 'Ndukaagu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ndukaagu - Learn Nigerian Languages',
    description: 'Master indigenous Nigerian languages with AI-powered personalized learning',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1c6834',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ndukaagu" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://ndukaagu.vercel.app" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
