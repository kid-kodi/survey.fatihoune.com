"use client";

import { useTranslations } from "next-intl";
import {
  GripVertical,
  List,
  BarChart3,
  Users,
  Smartphone,
  Download
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const features: Feature[] = [
  {
    icon: GripVertical,
    titleKey: "feature_1_title",
    descKey: "feature_1_desc",
  },
  {
    icon: List,
    titleKey: "feature_2_title",
    descKey: "feature_2_desc",
  },
  {
    icon: BarChart3,
    titleKey: "feature_3_title",
    descKey: "feature_3_desc",
  },
  {
    icon: Users,
    titleKey: "feature_4_title",
    descKey: "feature_4_desc",
  },
  {
    icon: Smartphone,
    titleKey: "feature_5_title",
    descKey: "feature_5_desc",
  },
  {
    icon: Download,
    titleKey: "feature_6_title",
    descKey: "feature_6_desc",
  },
];

export function FeaturesSection() {
  const t = useTranslations("Landing");

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("features_heading")}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-primary"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600">
                  {t(feature.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
