'use client'

import { useEffect } from 'react'
import { captureUTMParameters } from '@/lib/utm'

/**
 * Client component to capture UTM parameters on page load
 * Should be placed in the root layout
 */
export function UTMTracker() {
  useEffect(() => {
    // Capture UTM parameters on initial page load
    captureUTMParameters()
  }, [])

  return null
}
