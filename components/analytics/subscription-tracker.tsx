'use client'

import { useEffect } from 'react'
import { trackSubscription } from '@/lib/analytics'

interface SubscriptionTrackerProps {
  plan?: string
}

/**
 * Client component to track subscription events
 * Must be placed in a client-side page or component
 */
export function SubscriptionTracker({ plan = 'unknown' }: SubscriptionTrackerProps) {
  useEffect(() => {
    // Track subscription on mount (success page load)
    trackSubscription(plan)
  }, [plan])

  return null
}
