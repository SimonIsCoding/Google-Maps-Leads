import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || 'https://mapscraperhub.com'),
  title: 'MapScraperHub - Transform Google Maps Searches into Google Sheets',
  description: 'Turn Google Maps searches into organized Google Sheets data. Simple, fast, and affordable.',
  keywords: 'Google Maps, data extraction, lead generation, business intelligence, scraping',
  authors: [{ name: 'MapScraperHub' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mapscraperhub.com',
    siteName: 'MapScraperHub',
    title: 'MapScraperHub - Transform Google Maps Searches into Google Sheets',
    description: 'Turn Google Maps searches into organized Google Sheets data. Simple, fast, and affordable.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MapScraperHub - Transform Google Maps Searches into Google Sheets',
    description: 'Turn Google Maps searches into organized Google Sheets data. Simple, fast, and affordable.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
