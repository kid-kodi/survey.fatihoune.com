"use client";

import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: number;
  quoteKey: string;
  nameKey: string;
  titleKey: string;
  avatarUrl: string;
  rating: number;
}

export function TestimonialsSection() {
  const t = useTranslations('Landing');

  const testimonials: Testimonial[] = [
    {
      id: 1,
      quoteKey: 'testimonial_1_quote',
      nameKey: 'testimonial_1_name',
      titleKey: 'testimonial_1_title',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff&size=128',
      rating: 5,
    },
    {
      id: 2,
      quoteKey: 'testimonial_2_quote',
      nameKey: 'testimonial_2_name',
      titleKey: 'testimonial_2_title',
      avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6&color=fff&size=128',
      rating: 5,
    },
    {
      id: 3,
      quoteKey: 'testimonial_3_quote',
      nameKey: 'testimonial_3_name',
      titleKey: 'testimonial_3_title',
      avatarUrl: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff&size=128',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('testimonials_heading')}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              quote={t(testimonial.quoteKey)}
              name={t(testimonial.nameKey)}
              title={t(testimonial.titleKey)}
              avatarUrl={testimonial.avatarUrl}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
  rating: number;
}

function TestimonialCard({ quote, name, title, avatarUrl, rating }: TestimonialCardProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="w-8 h-8 text-blue-500 opacity-50" />
      </div>

      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="flex-grow mb-6">
        <p className="text-gray-700 leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>

      {/* Attribution */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
    </div>
  );
}
