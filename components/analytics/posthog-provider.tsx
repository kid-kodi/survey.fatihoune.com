'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, ReactNode } from 'react'

interface PostHogProviderProps {
  children: ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (typeof window !== 'undefined' && posthogKey) {
      // Check for DNT (Do Not Track)
      const dnt = navigator.doNotTrack === '1' ||
                  (navigator as any).msDoNotTrack === '1' ||
                  (window as any).doNotTrack === '1'

      // Check for analytics opt-out
      const analyticsOptOut = localStorage.getItem('analytics-opt-out') === 'true'

      // Check for cookie consent
      const cookieConsent = localStorage.getItem('cookie-consent')

      // Only initialize if user hasn't opted out and has consented
      if (!dnt && !analyticsOptOut && cookieConsent === 'accepted') {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          capture_pageview: true,
          capture_pageleave: true,
        })
      }
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
