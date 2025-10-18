import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WellPlate - AI Meal Plan Builder',
  description: 'Personalized meal plans done in 30 seconds. Get 7-day plans with calories, macros, recipes & grocery lists.',
  keywords: 'meal planning, nutrition, AI, diet, recipes, macros, calories',
  authors: [{ name: 'WellPlate Team' }],
  other: {
    'facebook-domain-verification': 'pixzyumgk89ayza44rqqecrectca1k',
  },
  openGraph: {
    title: 'WellPlate - AI Meal Plan Builder',
    description: 'Personalized meal plans done in 30 seconds. Get 7-day plans with calories, macros, recipes & grocery lists.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WellPlate - AI Meal Plan Builder',
    description: 'Personalized meal plans done in 30 seconds. Get 7-day plans with calories, macros, recipes & grocery lists.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
