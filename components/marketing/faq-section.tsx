"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqKeys = [
  "faq_1",
  "faq_2",
  "faq_3",
  "faq_4",
  "faq_5",
];

export function FaqSection() {
  const t = useTranslations("Features");

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("faq_heading")}
          </h2>
          <p className="text-lg text-gray-600">
            {t("faq_subheading")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqKeys.map((key, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-lg px-6 border"
            >
              <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:text-primary">
                {t(`${key}_question`)}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {t(`${key}_answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
