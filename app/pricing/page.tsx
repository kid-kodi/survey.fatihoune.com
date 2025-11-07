import { Metadata } from 'next';
import { MarketingLayout } from '@/components/layout/marketing-layout';
import { PricingCards } from '@/components/pricing/PricingCards';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { getTranslations } from "next-intl/server";
import { config } from "@/lib/config";

// Force static generation for pricing page
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  return {
    title: t("pricing_title"),
    description: t("pricing_description"),
    openGraph: {
      title: t("pricing_title"),
      description: t("pricing_description"),
      url: `${baseUrl}/pricing`,
      siteName: t("site_name"),
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t("site_name"),
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("pricing_title"),
      description: t("pricing_description"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/pricing`,
    },
  };
}

export default function PricingPage() {
  return (
    <MarketingLayout>
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
    </MarketingLayout>
  );
}
