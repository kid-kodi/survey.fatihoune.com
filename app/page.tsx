import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingTeaserSection } from "@/components/marketing/pricing-teaser-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { getTranslations } from "next-intl/server";
import { config } from "@/lib/config";
import type { Metadata } from "next";
import { ProductSchema } from "@/components/seo/json-ld";

// Force static generation for landing page
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  return {
    title: t("home_title"),
    description: t("home_description"),
    openGraph: {
      title: t("home_title"),
      description: t("home_description"),
      url: baseUrl,
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
      title: t("home_title"),
      description: t("home_description"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default function Home() {
  return (
    <>
      <ProductSchema />
      <MarketingLayout>
        <div className="pt-16">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <PricingTeaserSection />
          <FinalCtaSection />
        </div>
      </MarketingLayout>
    </>
  );
}
