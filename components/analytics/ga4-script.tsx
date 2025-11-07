'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export function GA4Script() {
  const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Check for cookie consent
    const cookieConsent = localStorage.getItem('cookie-consent')

    // Check for DNT (Do Not Track)
    const dnt = navigator.doNotTrack === '1' ||
                (navigator as any).msDoNotTrack === '1' ||
                (window as any).doNotTrack === '1'

    // Check for analytics opt-out
    const analyticsOptOut = localStorage.getItem('analytics-opt-out') === 'true'

    // Only load if user has consented and hasn't opted out
    if (cookieConsent === 'accepted' && !dnt && !analyticsOptOut) {
      setShouldLoad(true)
    }
  }, [])

  if (!GA4_ID || !shouldLoad) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}');
        `}
      </Script>
    </>
  )
}
