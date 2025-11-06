'use client';

import { Card } from '@/components/ui/card';
import { CreditCard, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';

type PaymentProvider = 'stripe' | 'wave' | 'orange_money';
type Currency = 'USD' | 'EUR' | 'XOF';

interface PaymentMethodOption {
  id: PaymentProvider;
  nameKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  currencies: Currency[];
  regionsKey: string;
}

interface PaymentMethodSelectorProps {
  selectedProvider: PaymentProvider;
  onProviderChange: (provider: PaymentProvider) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const paymentMethodsConfig: PaymentMethodOption[] = [
  {
    id: 'stripe',
    nameKey: 'payment_method_stripe',
    descriptionKey: 'payment_method_stripe_desc',
    icon: <CreditCard className="h-6 w-6" />,
    currencies: ['USD', 'EUR'],
    regionsKey: 'payment_method_stripe_regions',
  },
  {
    id: 'wave',
    nameKey: 'payment_method_wave',
    descriptionKey: 'payment_method_wave_desc',
    icon: <Smartphone className="h-6 w-6" />,
    currencies: ['XOF'],
    regionsKey: 'payment_method_wave_regions',
  },
  {
    id: 'orange_money',
    nameKey: 'payment_method_orange',
    descriptionKey: 'payment_method_orange_desc',
    icon: <Smartphone className="h-6 w-6" />,
    currencies: ['XOF'],
    regionsKey: 'payment_method_orange_regions',
  },
];

export function PaymentMethodSelector({
  selectedProvider,
  onProviderChange,
  selectedCurrency,
  onCurrencyChange,
}: PaymentMethodSelectorProps) {
  const t = useTranslations('Pricing');

  const handleProviderChange = (provider: PaymentProvider) => {
    onProviderChange(provider);

    // Auto-select appropriate currency based on provider
    const method = paymentMethodsConfig.find(m => m.id === provider);
    if (method && !method.currencies.includes(selectedCurrency)) {
      onCurrencyChange(method.currencies[0]);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">{t('select_payment_method')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {paymentMethodsConfig.map((method) => (
          <Card
            key={method.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedProvider === method.id
                ? 'border-blue-500 border-2 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleProviderChange(method.id)}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedProvider === method.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{t(method.nameKey)}</h4>
                <p className="text-xs text-gray-500 mt-1">{t(method.descriptionKey)}</p>
                <p className="text-xs text-gray-400 mt-1">{t(method.regionsKey)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Currency Selector (only for Stripe) */}
      {selectedProvider === 'stripe' && (
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">{t('currency_label')}</span>
          <div className="flex space-x-2">
            {['USD', 'EUR'].map((currency) => (
              <button
                key={currency}
                onClick={() => onCurrencyChange(currency as Currency)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  selectedCurrency === currency
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
