/**
 * Currency conversion and formatting utilities
 */

export type Currency = 'USD' | 'EUR' | 'XOF';

// Exchange rates (as of implementation, should be updated regularly)
// Base currency: USD
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92, // 1 USD = 0.92 EUR
  XOF: 620,  // 1 USD = 620 XOF (West African CFA Franc)
};

/**
 * Convert amount from USD to target currency
 */
export function convertCurrency(
  amountInUSD: number,
  targetCurrency: Currency
): number {
  const rate = EXCHANGE_RATES[targetCurrency];
  return Math.round(amountInUSD * rate);
}

/**
 * Get conversion rate between two currencies
 */
export function getConversionRate(from: Currency, to: Currency): number {
  const rates: Record<string, number> = {
    'USD_XOF': 620,
    'EUR_XOF': 656,
    'USD_EUR': 0.92,
    'EUR_USD': 1.09,
    'XOF_USD': 1 / 620,
    'XOF_EUR': 1 / 656,
  };

  return rates[`${from}_${to}`] || 1;
}

/**
 * Format currency amount with symbol (alias for formatCurrency)
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string {
  const localeMap: Record<Currency, string> = {
    'XOF': 'fr-FR',
    'EUR': 'fr-FR',
    'USD': 'en-US',
  };

  const targetLocale = localeMap[currency] || locale;

  return new Intl.NumberFormat(targetLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'XOF' ? 0 : 2,
    maximumFractionDigits: currency === 'XOF' ? 0 : 2,
  }).format(amount);
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string {
  switch (currency) {
    case 'USD':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);

    case 'EUR':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);

    case 'XOF':
      // XOF uses a specific format: "15 000 FCFA"
      const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
      return `${formatted} FCFA`;

    default:
      return `$${amount}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'XOF':
      return 'FCFA';
    default:
      return '$';
  }
}

/**
 * Get billing period label based on locale and currency
 */
export function getBillingPeriodLabel(
  period: 'monthly' | 'annually',
  locale: string = 'en'
): string {
  if (locale === 'fr') {
    return period === 'monthly' ? '/mois' : '/an';
  }
  return period === 'monthly' ? '/month' : '/year';
}
