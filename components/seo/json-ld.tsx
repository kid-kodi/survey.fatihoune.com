import { config } from "@/lib/config";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export function OrganizationSchema() {
  const baseUrl = config.app.url;

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Survey Platform",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.png`,
    "description": "Modern survey tool for creating, distributing, and analyzing surveys",
    "sameAs": [
      // Add social media links when available
    ]
  };

  return <JsonLd data={data} />;
}

// Product/Software Application Schema
export function ProductSchema() {
  const baseUrl = config.app.url;

  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Survey Platform",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free plan available with paid upgrades"
    },
    "description": "Modern survey tool for creating, distributing, and analyzing surveys. Free plan available. No credit card required.",
    "url": baseUrl,
    "screenshot": `${baseUrl}/og-image.png`,
  };

  return <JsonLd data={data} />;
}

// FAQ Page Schema
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return <JsonLd data={data} />;
}

// Blog Posting Schema
interface BlogPostingSchemaProps {
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  updatedAt: Date;
  author: {
    name: string | null;
  };
  slug: string;
}

export function BlogPostingSchema({ title, excerpt, publishedAt, updatedAt, author, slug }: BlogPostingSchemaProps) {
  const baseUrl = config.app.url;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": excerpt,
    "datePublished": publishedAt?.toISOString(),
    "dateModified": updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": author.name || "Survey Platform Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Survey Platform",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${slug}`
    },
    "image": `${baseUrl}/blog/${slug}/opengraph-image`
  };

  return <JsonLd data={data} />;
}
