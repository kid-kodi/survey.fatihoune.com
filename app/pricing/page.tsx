import { Metadata } from 'next';
import { PricingCards } from '@/components/pricing/PricingCards';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';

export const metadata: Metadata = {
  title: 'Pricing - Survey Platform',
  description: 'Choose the perfect plan for your survey needs',
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600">
          Choose the plan that fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Pricing Cards (includes CurrencySelector and ExchangeRateInfo) */}
      <PricingCards />

      {/* FAQ Section */}
      <PricingFAQ />
    </div>
  );
}
