'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { useState, useTransition } from 'react'

export function LanguageSelector() {
  const t = useTranslations('LanguageSelector')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Store locale preference in cookie
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`

      // Remove the current locale prefix from pathname if it exists
      const currentLocalePrefix = `/${locale}`
      const pathnameWithoutLocale = pathname.startsWith(currentLocalePrefix)
        ? pathname.slice(currentLocalePrefix.length)
        : pathname

      // Redirect to the new locale
      const newPath = `/${newLocale}${pathnameWithoutLocale || ''}`
      router.push(newPath)
      router.refresh()
    })
  }

  const languages = [
    { code: 'en', flag: '🇬🇧', name: t('english') },
    { code: 'fr', flag: '🇫🇷', name: t('french') },
  ]

  const currentLanguage = languages.find((lang) => lang.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag} {currentLanguage?.name}</span>
          <span className="sm:hidden">{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLocale(language.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {locale === language.code && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
