'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { detectCurrencyFromLocation } from '@/lib/utils/location-detection';
import type { Currency } from '@/lib/utils/currency';

const currencies = [
  { code: 'USD' as Currency, symbol: '$', name: 'US Dollar' },
  { code: 'EUR' as Currency, symbol: '€', name: 'Euro' },
  { code: 'XOF' as Currency, symbol: 'FCFA', name: 'West African CFA Franc' },
];

interface CurrencySelectorProps {
  value?: Currency;
  onChange?: (currency: Currency) => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [internalCurrency, setInternalCurrency] = useState<Currency>(() => {
    // Initialize from localStorage or default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredCurrency') as Currency | null;
      if (saved) return saved;
    }
    return 'USD';
  });

  // Use controlled value if provided, otherwise use internal state
  const currency = value ?? internalCurrency;

  useEffect(() => {
    // Auto-detect based on location only if no saved preference and not controlled
    if (!value && typeof window !== 'undefined' && !localStorage.getItem('preferredCurrency')) {
      detectCurrencyFromLocation().then((detected) => {
        setInternalCurrency(detected);
        localStorage.setItem('preferredCurrency', detected);
        if (onChange) {
          onChange(detected);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (newCurrency: string) => {
    const curr = newCurrency as Currency;

    // Update internal state if not controlled
    if (!value) {
      setInternalCurrency(curr);
    }

    localStorage.setItem('preferredCurrency', curr);

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: curr }));

    // Call parent onChange if provided
    if (onChange) {
      onChange(curr);
    }
  };

  return (
    <Select value={currency} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            {curr.symbol} {curr.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
