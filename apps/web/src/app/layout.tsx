import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
      <head>
        {/* Meta Pixel Code */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '788765987308138');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=788765987308138&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
