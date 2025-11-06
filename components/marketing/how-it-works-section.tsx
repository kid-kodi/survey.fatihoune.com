"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, FileEdit, Share2, BarChart3 } from "lucide-react";

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}

function Step({ number, icon, title, description, isLast }: StepProps) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Step Number and Icon */}
      <div className="relative z-10 mb-4 flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-primary bg-white shadow-lg">
        <div className="mb-1 text-2xl font-bold text-primary">{number}</div>
        <div className="text-primary">{icon}</div>
      </div>

      {/* Connecting Line (Desktop only) */}
      {!isLast && (
        <div className="absolute left-1/2 top-12 hidden h-1 w-full -translate-y-1/2 bg-gradient-to-r from-primary/60 to-primary/20 md:block" />
      )}

      {/* Step Content */}
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const t = useTranslations("Landing");

  const steps = [
    {
      number: 1,
      icon: <UserPlus className="h-8 w-8" />,
      titleKey: "step_1_title",
      descKey: "step_1_desc",
    },
    {
      number: 2,
      icon: <FileEdit className="h-8 w-8" />,
      titleKey: "step_2_title",
      descKey: "step_2_desc",
    },
    {
      number: 3,
      icon: <Share2 className="h-8 w-8" />,
      titleKey: "step_3_title",
      descKey: "step_3_desc",
    },
    {
      number: 4,
      icon: <BarChart3 className="h-8 w-8" />,
      titleKey: "step_4_title",
      descKey: "step_4_desc",
    },
  ];

  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("how_it_works_heading")}
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          {steps.map((step, index) => (
            <Step
              key={step.number}
              number={step.number}
              icon={step.icon}
              title={t(step.titleKey)}
              description={t(step.descKey)}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 flex justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg">
              {t("start_creating")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
