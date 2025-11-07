// Analytics event tracking helpers

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (command: string, ...args: any[]) => void
  }
}

/**
 * Track a custom event in Google Analytics 4
 * @param eventName - The name of the event to track
 * @param eventParams - Optional parameters to attach to the event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

/**
 * Track user sign up event
 */
export const trackSignUp = () => {
  trackEvent('sign_up')
}

/**
 * Track subscription start event
 * @param plan - The subscription plan name
 */
export const trackSubscription = (plan: string) => {
  trackEvent('subscription_start', { plan })
}

/**
 * Track survey creation event
 */
export const trackSurveyCreated = () => {
  trackEvent('survey_created')
}

/**
 * Track page view (called automatically by GA4, but can be used for SPAs)
 * @param url - The page URL
 */
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '', {
      page_path: url,
    })
  }
}
