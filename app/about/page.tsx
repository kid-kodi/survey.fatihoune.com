import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { getTranslations } from "next-intl/server";
import {
  Target,
  Shield,
  Zap,
  Lightbulb,
  Users,
  Mail
} from "lucide-react";
import { config } from "@/lib/config";
import type { Metadata } from "next";

// Force static generation for about page
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  return {
    title: t("about_title"),
    description: t("about_description"),
    openGraph: {
      title: t("about_title"),
      description: t("about_description"),
      url: `${baseUrl}/about`,
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
      title: t("about_title"),
      description: t("about_description"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/about`,
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  const values = [
    {
      icon: Target,
      titleKey: "value_1_title",
      descKey: "value_1_desc",
    },
    {
      icon: Shield,
      titleKey: "value_2_title",
      descKey: "value_2_desc",
    },
    {
      icon: Zap,
      titleKey: "value_3_title",
      descKey: "value_3_desc",
    },
    {
      icon: Lightbulb,
      titleKey: "value_4_title",
      descKey: "value_4_desc",
    },
  ];

  const techStack = [
    {
      name: "Next.js",
      description: t("tech_nextjs"),
      version: "16",
    },
    {
      name: "React",
      description: t("tech_react"),
      version: "19",
    },
    {
      name: "TypeScript",
      description: t("tech_typescript"),
      version: "5.x",
    },
    {
      name: "PostgreSQL",
      description: t("tech_postgresql"),
      version: "15+",
    },
    {
      name: "Tailwind CSS",
      description: t("tech_tailwind"),
      version: "4.x",
    },
  ];

  const teamMembers = [
    {
      name: t("team_member_1_name"),
      title: t("team_member_1_title"),
      bio: t("team_member_1_bio"),
    },
    {
      name: t("team_member_2_name"),
      title: t("team_member_2_title"),
      bio: t("team_member_2_bio"),
    },
  ];

  return (
    <MarketingLayout>
      {/* Main Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("hero_heading")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("mission")}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                {t("story_heading")}
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("story_content")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              {t("values_heading")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {t(value.titleKey)}
                        </h3>
                        <p className="text-muted-foreground">
                          {t(value.descKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              {t("team_heading")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.title}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              {t("tech_heading")}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              {t("tech_subheading")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold">{tech.name}</h3>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      v{tech.version}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <Mail className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                {t("contact_cta_heading")}
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                {t("contact_cta_description")}
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full md:w-auto px-8 py-6 text-lg font-semibold"
              >
                <Link href="/contact">{t("contact_cta")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
