'use client';

import { getConversionRate, formatPrice } from '@/lib/utils/currency';
import type { Currency } from '@/lib/utils/currency';
import { useLocale } from 'next-intl';

interface ExchangeRateInfoProps {
  baseCurrency: Currency;
}

export function ExchangeRateInfo({ baseCurrency }: ExchangeRateInfoProps) {
  const locale = useLocale();

  if (baseCurrency === 'USD') return null;

  const rate = getConversionRate('USD', baseCurrency);
  const formattedRate = formatPrice(rate, baseCurrency, locale);

  const approximateText = locale === 'fr'
    ? '(approximatif, mis à jour trimestriellement)'
    : '(approximate, updated quarterly)';

  return (
    <p className="text-sm text-gray-500 mt-4 text-center">
      1 USD ≈ {formattedRate}
      <span className="ml-2 text-xs">{approximateText}</span>
    </p>
  );
}
