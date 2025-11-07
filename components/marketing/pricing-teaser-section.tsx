import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PricingCardMini } from "./pricing-card-mini";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PricingTeaserSection() {
  const t = await getTranslations("Landing");

  // Check if user is authenticated and fetch their current plan
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(m => m.headers())
  });
  let currentPlanType: string | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        currentPlan: true,
      },
    });
    currentPlanType = user?.currentPlan?.name?.toLowerCase() || "free";
  }

  // Pricing plans data
  const plans = [
    {
      name: t("plan_free_name"),
      price: t("plan_free_price"),
      feature: t("plan_free_feature"),
      ctaText: t("plan_free_cta"),
      ctaHref: "/register",
      planType: "free",
      isMostPopular: false,
    },
    {
      name: t("plan_pro_name"),
      price: t("plan_pro_price"),
      feature: t("plan_pro_feature"),
      ctaText: t("plan_pro_cta"),
      ctaHref: session ? "/pricing" : "/register",
      planType: "pro",
      isMostPopular: true,
    },
    {
      name: t("plan_premium_name"),
      price: t("plan_premium_price"),
      feature: t("plan_premium_feature"),
      ctaText: t("plan_premium_cta"),
      ctaHref: session ? "/pricing" : "/register",
      planType: "premium",
      isMostPopular: false,
    },
    {
      name: t("plan_custom_name"),
      price: t("plan_custom_price"),
      feature: t("plan_custom_feature"),
      ctaText: t("plan_custom_cta"),
      ctaHref: "/contact",
      planType: "custom",
      isMostPopular: false,
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t("pricing_teaser_heading")}
          </h2>
          <Link href="/pricing">
            <Button variant="link" className="text-base">
              {t("view_full_pricing")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCardMini
              key={plan.planType}
              name={plan.name}
              price={plan.price}
              feature={plan.feature}
              ctaText={plan.ctaText}
              ctaHref={plan.ctaHref}
              isCurrentPlan={currentPlanType?.toLowerCase() === plan.planType}
              isMostPopular={plan.isMostPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
