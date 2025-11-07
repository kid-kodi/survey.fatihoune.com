'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Github, Linkedin, Twitter } from 'lucide-react'
import { LanguageSelector } from './language-selector'
import Logo from '@/components/Logo'

export function Footer() {
  const t = useTranslations('Footer')
  const currentYear = new Date().getFullYear()

  const productLinks = [
    { href: '/features', label: t('product_features') },
    { href: '/pricing', label: t('product_pricing') },
    { href: '/templates', label: t('product_templates') },
    { href: '/integrations', label: t('product_integrations') },
  ]

  const companyLinks = [
    { href: '/about', label: t('company_about') },
    { href: '/blog', label: t('company_blog') },
    { href: '/contact', label: t('company_contact') },
    { href: '/careers', label: t('company_careers') },
  ]

  const resourceLinks = [
    { href: '/docs', label: t('resources_documentation') },
    { href: '/help', label: t('resources_help') },
    { href: '/api-docs', label: t('resources_api') },
    { href: 'https://status.example.com', label: t('resources_status'), external: true },
  ]

  const legalLinks = [
    { href: '/privacy', label: t('legal_privacy') },
    { href: '/terms', label: t('legal_terms') },
    { href: '/cookies', label: t('legal_cookies') },
  ]

  const socialLinks = [
    { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
  ]

  return (
    <footer className="bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('product_title')}</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('company_title')}</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('resources_title')}</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('legal_title')}</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo and Copyright */}
            <div className="flex items-center gap-4">
              <Logo />
              <p className="text-sm text-muted-foreground">
                {t('copyright', { year: currentYear })}
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>

            {/* Language Selector */}
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  )
}
