// UTM parameter tracking utilities

export interface UTMParams {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
}

/**
 * Capture UTM parameters from URL and store in sessionStorage
 */
export function captureUTMParameters(): UTMParams | null {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)

  const utmParams: UTMParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
  }

  // Only store if at least one UTM parameter exists
  const hasUTMParams = Object.values(utmParams).some(val => val !== null)

  if (hasUTMParams) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams))
    return utmParams
  }

  return null
}

/**
 * Get stored UTM parameters from sessionStorage
 */
export function getUTMParameters(): UTMParams | null {
  if (typeof window === 'undefined') return null

  const stored = sessionStorage.getItem('utm_params')
  if (!stored) return null

  try {
    return JSON.parse(stored) as UTMParams
  } catch {
    return null
  }
}

/**
 * Clear stored UTM parameters from sessionStorage
 */
export function clearUTMParameters(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('utm_params')
}

/**
 * Get UTM parameters as a flat object for analytics tracking
 */
export function getUTMParamsForTracking(): Record<string, string> {
  const utmParams = getUTMParameters()
  if (!utmParams) return {}

  const flatParams: Record<string, string> = {}

  for (const [key, value] of Object.entries(utmParams)) {
    if (value) {
      flatParams[key] = value
    }
  }

  return flatParams
}
