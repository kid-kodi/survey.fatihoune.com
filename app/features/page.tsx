import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { FeatureHero } from "@/components/marketing/feature-hero";
import { FeatureCategory } from "@/components/marketing/feature-category";
import { FaqSection } from "@/components/marketing/faq-section";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { config } from "@/lib/config";
import type { Metadata } from "next";
import { FAQSchema } from "@/components/seo/json-ld";

// Force static generation for features page
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  return {
    title: t("features_title"),
    description: t("features_description"),
    openGraph: {
      title: t("features_title"),
      description: t("features_description"),
      url: `${baseUrl}/features`,
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
      title: t("features_title"),
      description: t("features_description"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/features`,
    },
  };
}

interface Feature {
  iconName: string;
  titleKey: string;
  descKey: string;
}

// Survey Creation Features
const surveyCreationFeatures: Feature[] = [
  {
    iconName: "GripVertical",
    titleKey: "survey_creation_drag_drop_title",
    descKey: "survey_creation_drag_drop_desc",
  },
  {
    iconName: "List",
    titleKey: "survey_creation_question_types_title",
    descKey: "survey_creation_question_types_desc",
  },
  {
    iconName: "Workflow",
    titleKey: "survey_creation_templates_title",
    descKey: "survey_creation_templates_desc",
  },
  {
    iconName: "GitBranch",
    titleKey: "survey_creation_conditional_title",
    descKey: "survey_creation_conditional_desc",
  },
];

// Distribution Features
const distributionFeatures: Feature[] = [
  {
    iconName: "Link2",
    titleKey: "distribution_links_title",
    descKey: "distribution_links_desc",
  },
  {
    iconName: "Code",
    titleKey: "distribution_embed_title",
    descKey: "distribution_embed_desc",
  },
  {
    iconName: "QrCode",
    titleKey: "distribution_qr_title",
    descKey: "distribution_qr_desc",
  },
];

// Analytics Features
const analyticsFeatures: Feature[] = [
  {
    iconName: "Activity",
    titleKey: "analytics_realtime_title",
    descKey: "analytics_realtime_desc",
  },
  {
    iconName: "BarChart3",
    titleKey: "analytics_charts_title",
    descKey: "analytics_charts_desc",
  },
  {
    iconName: "Download",
    titleKey: "analytics_export_title",
    descKey: "analytics_export_desc",
  },
  {
    iconName: "Filter",
    titleKey: "analytics_filtering_title",
    descKey: "analytics_filtering_desc",
  },
];

// Collaboration Features
const collaborationFeatures: Feature[] = [
  {
    iconName: "Building2",
    titleKey: "collaboration_organizations_title",
    descKey: "collaboration_organizations_desc",
  },
  {
    iconName: "Shield",
    titleKey: "collaboration_roles_title",
    descKey: "collaboration_roles_desc",
  },
  {
    iconName: "Users",
    titleKey: "collaboration_members_title",
    descKey: "collaboration_members_desc",
  },
];

export default async function FeaturesPage() {
  const t = await getTranslations("Features");

  // Prepare FAQ data for structured data
  const faqKeys = ["faq_1", "faq_2", "faq_3", "faq_4", "faq_5"];
  const faqs = faqKeys.map(key => ({
    question: t(`${key}_question`),
    answer: t(`${key}_answer`),
  }));

  return (
    <>
      <FAQSchema faqs={faqs} />
      <MarketingLayout>
        <div className="pt-16">
          {/* Hero Section */}
          <FeatureHero />

        {/* Survey Creation Category */}
        <FeatureCategory
          categoryKey="survey_creation"
          features={surveyCreationFeatures}
          startIndex={0}
        />

        {/* Distribution Category */}
        <FeatureCategory
          categoryKey="distribution"
          features={distributionFeatures}
          startIndex={4}
        />

        {/* Analytics Category */}
        <FeatureCategory
          categoryKey="analytics"
          features={analyticsFeatures}
          startIndex={7}
        />

        {/* Collaboration Category */}
        <FeatureCategory
          categoryKey="collaboration"
          features={collaborationFeatures}
          startIndex={11}
        />

        {/* FAQ Section */}
        <FaqSection />

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-primary to-primary/80 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {t("cta_heading")}
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {t("cta_subheading")}
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="w-full md:w-auto px-8 py-6 text-lg font-semibold"
            >
              <Link href="/register">{t("cta_button")}</Link>
            </Button>
          </div>
        </section>
      </div>
    </MarketingLayout>
    </>
  );
}
