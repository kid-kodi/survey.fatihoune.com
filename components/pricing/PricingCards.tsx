'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CurrencySelector } from './CurrencySelector';
import { ExchangeRateInfo } from './ExchangeRateInfo';
import { getSuggestedPaymentProvider, detectCurrencyFromLocation } from '@/lib/utils/location-detection';
import { convertCurrency, formatCurrency, getBillingPeriodLabel } from '@/lib/utils/currency';
import type { Currency } from '@/lib/utils/currency';
import { useLocale } from 'next-intl';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, annually: 0 },
    currency: 'USD',
    features: [
      '5 surveys',
      'Basic analytics',
      'CSV export',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 29, annually: 290 }, // ~17% discount
    currency: 'USD',
    features: [
      '1 organization',
      '5 team members',
      '50 surveys',
      'Advanced analytics',
      'Priority support',
      'Custom domain',
    ],
    cta: 'Subscribe Now',
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 99, annually: 990 }, // ~17% discount
    currency: 'USD',
    features: [
      'Unlimited organizations',
      'Unlimited members',
      'Unlimited surveys',
      'Custom branding',
      'API access',
      'Dedicated support',
      'Advanced integrations',
    ],
    cta: 'Subscribe Now',
    highlighted: false,
  },
  {
    id: 'custom',
    name: 'Custom',
    price: { monthly: null, annually: null },
    currency: 'USD',
    features: [
      'Everything in Premium',
      'Custom contracts',
      'SSO/SAML',
      'Dedicated account manager',
      'SLA guarantees',
      'On-premise deployment',
    ],
    cta: 'Contact Us',
    highlighted: false,
  },
];

type PaymentProvider = 'stripe' | 'wave' | 'orange_money';

export function PricingCards() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('stripe');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();

  // Initialize currency and payment provider based on location
  useEffect(() => {
    async function initialize() {
      try {
        // Check localStorage first
        const savedCurrency = localStorage.getItem('preferredCurrency') as Currency | null;

        if (savedCurrency) {
          setDisplayCurrency(savedCurrency);
        } else {
          // Auto-detect based on location
          const detectedCurrency = await detectCurrencyFromLocation();
          setDisplayCurrency(detectedCurrency);
        }

        // Initialize payment provider
        const suggestedProvider = await getSuggestedPaymentProvider();
        setPaymentProvider(suggestedProvider);
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Update user preferences when payment provider changes
  const handleProviderChange = async (provider: PaymentProvider) => {
    setPaymentProvider(provider);

    // Update user preferences in the backend
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredPaymentProvider: provider,
        }),
      });
    } catch (error) {
      console.error('Failed to update payment provider preference:', error);
    }
  };

  // Update display currency when user changes currency selector
  const handleDisplayCurrencyChange = (newCurrency: Currency) => {
    setDisplayCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Update payment currency when payment provider changes
  const handlePaymentCurrencyChange = async (newCurrency: Currency) => {
    setPaymentCurrency(newCurrency);

    // Update user preferences in the backend
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredCurrency: newCurrency,
        }),
      });
    } catch (error) {
      console.error('Failed to update currency preference:', error);
    }
  };

  async function handleSubscribe(planId: string) {
    if (planId === 'free') {
      router.push('/register');
      return;
    }

    if (planId === 'custom') {
      router.push('/contact');
      return;
    }

    // Redirect to checkout with selected payment provider
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        billingPeriod,
        paymentProvider,
      }),
    });

    const { url } = await response.json();
    window.location.assign(url);
  }

  // Helper to get converted price
  const getConvertedPrice = (priceInUSD: number | null): number | null => {
    if (priceInUSD === null) return null;
    return convertCurrency(priceInUSD, displayCurrency);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-gray-500">{locale === 'fr' ? 'Chargement des options tarifaires...' : 'Loading pricing options...'}</div>
      </div>
    );
  }

  return (
    <>
      {/* Currency Selector */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            {locale === 'fr' ? 'Afficher les prix en:' : 'Display prices in:'}
          </label>
          <CurrencySelector
            value={displayCurrency}
            onChange={handleDisplayCurrencyChange}
          />
        </div>
      </div>

      {/* Exchange Rate Info */}
      <ExchangeRateInfo baseCurrency={displayCurrency} />

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedProvider={paymentProvider}
        onProviderChange={handleProviderChange}
        selectedCurrency={paymentCurrency}
        onCurrencyChange={handlePaymentCurrencyChange}
      />

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              billingPeriod === 'monthly'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-600'
            }`}
          >
            {locale === 'fr' ? 'Mensuel' : 'Monthly'}
          </button>
          <button
            onClick={() => setBillingPeriod('annually')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              billingPeriod === 'annually'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-600'
            }`}
          >
            {locale === 'fr' ? 'Annuel' : 'Annual'}
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
              {locale === 'fr' ? 'Économisez 17%' : 'Save 17%'}
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.highlighted
                ? 'border-blue-500 border-2 shadow-lg'
                : 'border-gray-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                {plan.price[billingPeriod] === null ? (
                  <p className="text-3xl font-bold">{locale === 'fr' ? 'Personnalisé' : 'Custom'}</p>
                ) : plan.price[billingPeriod] === 0 ? (
                  <p className="text-3xl font-bold">{locale === 'fr' ? 'Gratuit' : 'Free'}</p>
                ) : (
                  <>
                    <p className="text-4xl font-bold">
                      {formatCurrency(
                        getConvertedPrice(plan.price[billingPeriod])!,
                        displayCurrency,
                        locale
                      )}
                    </p>
                    <p className="text-gray-600">
                      {getBillingPeriodLabel(billingPeriod, locale)}
                    </p>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
