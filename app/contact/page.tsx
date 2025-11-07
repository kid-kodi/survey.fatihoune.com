import { getTranslations } from 'next-intl/server';
import { MarketingLayout } from '@/components/layout/marketing-layout';
import { ContactForm } from './contact-form';
import { Mail, Linkedin, Twitter, Github } from 'lucide-react';
import { config } from "@/lib/config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  return {
    title: t("contact_title"),
    description: t("contact_description"),
    openGraph: {
      title: t("contact_title"),
      description: t("contact_description"),
      url: `${baseUrl}/contact`,
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
      title: t("contact_title"),
      description: t("contact_description"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations('Contact');

  return (
    <MarketingLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('hero_heading')}</h1>
          <p className="text-xl text-gray-600">{t('hero_subheading')}</p>
        </div>

        {/* Contact Form */}
        <ContactForm />

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-6">{t('other_ways_heading')}</h2>

          <div className="flex flex-col items-center space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5" />
              <a
                href="mailto:support@survey.fatihoune.com"
                className="hover:text-blue-600 transition-colors"
              >
                support@survey.fatihoune.com
              </a>
            </div>

            {/* Social Media Links */}
            <div className="flex gap-6 mt-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
