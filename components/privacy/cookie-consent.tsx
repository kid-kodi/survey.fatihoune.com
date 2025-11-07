'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function CookieConsent() {
  const [show, setShow] = useState(false)
  const t = useTranslations('Privacy')

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
    // Reload to initialize analytics scripts
    window.location.reload()
  }

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    localStorage.setItem('analytics-opt-out', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg animate-in slide-in-from-bottom">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h3 className="mb-1 font-semibold">{t('cookie_banner_title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('cookie_banner_description')}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectCookies}
              className="w-full sm:w-auto"
            >
              {t('cookie_banner_reject')}
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="w-full sm:w-auto"
            >
              {t('cookie_banner_accept')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
