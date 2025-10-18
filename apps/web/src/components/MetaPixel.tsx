'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    fbq: any
  }
}

export function MetaPixel() {
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Safe TypeScript guard and dev visibility
    if (typeof window !== 'undefined' && window.fbq) {
      console.log('Meta Pixel initialized')
    }
  }, [])

  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => {
          // Ensure pixel only fires once per page load
          if (typeof window !== 'undefined' && window.fbq && !hasInitialized.current) {
            window.fbq('init', '788765987308138')
            window.fbq('track', 'PageView')
            hasInitialized.current = true
          }
        }}
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
          `,
        }}
      />
      
      {/* Noscript fallback */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=788765987308138&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  )
}
