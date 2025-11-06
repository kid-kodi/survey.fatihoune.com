/**
 * Supported locales for email templates
 */
export type EmailLocale = 'en' | 'fr';

/**
 * Base props that all email templates should support
 */
export interface BaseEmailProps {
  /**
   * Locale for the email (defaults to 'en')
   */
  locale?: EmailLocale;
}

/**
 * Common text translations for emails
 */
export interface EmailTranslations {
  greeting: string;
  footer: {
    company: string;
    tagline: string;
    allRightsReserved: string;
    unsubscribe: string;
    contactUs: string;
  };
}

/**
 * Get translations for a given locale
 */
export function getEmailTranslations(locale: EmailLocale = 'en'): EmailTranslations {
  const translations: Record<EmailLocale, EmailTranslations> = {
    en: {
      greeting: 'Hello',
      footer: {
        company: 'Survey Platform',
        tagline: 'Professional survey solutions',
        allRightsReserved: 'All rights reserved',
        unsubscribe: 'Unsubscribe',
        contactUs: 'Contact us',
      },
    },
    fr: {
      greeting: 'Bonjour',
      footer: {
        company: 'Plateforme de Sondage',
        tagline: 'Solutions professionnelles de sondage',
        allRightsReserved: 'Tous droits réservés',
        unsubscribe: 'Se désabonner',
        contactUs: 'Nous contacter',
      },
    },
  };

  return translations[locale];
}
