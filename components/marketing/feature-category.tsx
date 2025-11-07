"use client";

import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";

interface Feature {
  iconName: string;
  titleKey: string;
  descKey: string;
}

interface FeatureCategoryProps {
  categoryKey: string;
  features: Feature[];
  startIndex: number;
}

export function FeatureCategory({
  categoryKey,
  features,
  startIndex,
}: FeatureCategoryProps) {
  const t = useTranslations("Features");

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t(`${categoryKey}_heading`)}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t(`${categoryKey}_description`)}
          </p>
        </div>

        {/* Features in Alternating Layout */}
        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => {
            const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[feature.iconName] || LucideIcons.ImageIcon;
            const isEven = (startIndex + index) % 2 === 0;

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 md:gap-12 items-center`}
              >
                {/* Image/Mockup Placeholder */}
                <div className="flex-1 w-full">
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                    <IconComponent className="h-24 w-24 text-gray-400" />
                  </div>
                </div>

                {/* Feature Content */}
                <div className="flex-1 space-y-4">
                  {/* Icon Badge */}
                  <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                    <IconComponent className="h-8 w-8" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
