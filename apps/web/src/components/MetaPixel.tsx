'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    fbq: any
    _fbqInitialized?: boolean
  }
}

export default function MetaPixel() {
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent duplicate initialization across component re-renders
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Global flag to prevent multiple initializations
    if (typeof window !== 'undefined') {
      window._fbqInitialized = true
    }
  }, [])

  return (
    <>
      <Script 
        id="meta-pixel" 
        strategy="afterInteractive"
        onLoad={() => {
          // Only initialize if not already done
          if (typeof window !== 'undefined' && window.fbq && !window._fbqInitialized) {
            window.fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID || '788765987308138')
            window.fbq('track', 'PageView')
            window._fbqInitialized = true
            console.log('Meta Pixel initialized once')
          }
        }}
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || "788765987308138"}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
