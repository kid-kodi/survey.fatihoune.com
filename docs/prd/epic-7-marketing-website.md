# Epic 7: Marketing Website & Landing Pages

**Epic Goal**: Create a comprehensive public-facing marketing website with landing page, pricing page, features showcase, services overview, about page, contact form, and SEO optimization. This epic transforms the platform from an application-only product into a complete SaaS offering with professional marketing presence. By the end of this epic, the platform will have a polished marketing website that drives user acquisition, communicates value propositions, and converts visitors into registered users.

---

## Overview

This epic delivers a full marketing website with:
- Landing page at root `/` with hero, features, benefits, testimonials, CTA
- Pricing page at `/pricing` (enhanced from Epic 6)
- Features/Services page at `/features`
- About page at `/about`
- Contact page at `/contact`
- Blog foundation at `/blog` (optional)
- SEO optimization, meta tags, structured data
- Analytics tracking integration

---

## Story 7.1: Landing Page - Hero Section

As a potential user visiting the website,
I want to see a compelling hero section that explains what the platform does,
So that I can quickly understand the value proposition and take action.

### Acceptance Criteria

1. Landing page created at root `/` with public access
2. Hero section includes headline: "Create Beautiful Surveys in Minutes" (i18n: `Landing.hero_headline`)
3. Subheadline: "Collect feedback, analyze responses, and make data-driven decisions with our modern survey platform" (i18n: `Landing.hero_subheadline`)
4. Primary CTA button: "Get Started Free" links to /register (i18n: `Landing.get_started_free`)
5. Secondary CTA button: "View Pricing" links to /pricing (i18n: `Landing.view_pricing`)
6. Hero includes high-quality illustration or screenshot of survey builder
7. Hero uses gradient background with brand colors
8. Responsive layout: stacked on mobile, side-by-side on desktop
9. Hero section includes social proof: "Join 1,000+ users creating surveys" (i18n: `Landing.social_proof`)
10. Smooth scroll to next section on scroll indicator click
11. All copy fully translated (en.json, fr.json)

---

## Story 7.2: Landing Page - Features Section

As a potential user,
I want to see key platform features highlighted,
So that I can understand what capabilities the platform offers.

### Acceptance Criteria

1. Features section displays 6 key features in grid layout
2. Feature 1: "Drag & Drop Builder" with icon, title, description (i18n: `Landing.feature_1_*`)
3. Feature 2: "Multiple Question Types" - "Text, multiple choice, rating scales, and more" (i18n: `Landing.feature_2_*`)
4. Feature 3: "Real-time Analytics" - "View responses and insights as they come in" (i18n: `Landing.feature_3_*`)
5. Feature 4: "Team Collaboration" - "Work together with organizations and roles" (i18n: `Landing.feature_4_*`)
6. Feature 5: "Mobile Optimized" - "Surveys that look great on any device" (i18n: `Landing.feature_5_*`)
7. Feature 6: "Data Export" - "Export responses to CSV for deeper analysis" (i18n: `Landing.feature_6_*`)
8. Each feature includes Lucide icon, heading, and description
9. Features displayed in 2 columns on mobile, 3 columns on desktop
10. Subtle hover animations on feature cards
11. Section heading: "Everything you need to create surveys" (i18n: `Landing.features_heading`)
12. All feature titles and descriptions fully translated

---

## Story 7.3: Landing Page - How It Works Section

As a potential user,
I want to see a simple explanation of how the platform works,
So that I can understand the workflow before signing up.

### Acceptance Criteria

1. "How It Works" section with 4-step process
2. Step 1: "Sign Up" - "Create your free account in seconds" with icon (i18n: `Landing.step_1_*`)
3. Step 2: "Build Your Survey" - "Choose a template or start from scratch" (i18n: `Landing.step_2_*`)
4. Step 3: "Share & Collect" - "Send your survey link and gather responses" (i18n: `Landing.step_3_*`)
5. Step 4: "Analyze Results" - "View insights and export your data" (i18n: `Landing.step_4_*`)
6. Steps displayed horizontally with connecting lines on desktop
7. Steps stacked vertically on mobile
8. Each step numbered with large visual indicator (1, 2, 3, 4)
9. Section includes CTA: "Start Creating Surveys" links to /register (i18n: `Landing.start_creating`)
10. Animated counters or progress indicators (optional enhancement)
11. All step titles and descriptions fully translated

---

## Story 7.4: Landing Page - Testimonials Section

As a potential user,
I want to see testimonials from real users,
So that I can trust the platform and see social proof.

### Acceptance Criteria

1. Testimonials section displays 3 user testimonials
2. Each testimonial includes: quote, user name, title/company, avatar
3. Testimonial 1: Small business owner praising ease of use
4. Testimonial 2: Academic researcher highlighting analytics features
5. Testimonial 3: Team lead emphasizing collaboration features
6. Testimonials displayed in carousel or card grid
7. Avatar images use placeholder avatars or real user photos (with permission)
8. Section heading: "Loved by teams everywhere" (i18n: `Landing.testimonials_heading`)
9. Responsive layout: 1 column mobile, 3 columns desktop
10. Optional: Star ratings displayed with each testimonial
11. Testimonial quotes and attribution fully translated (generic examples)

---

## Story 7.5: Landing Page - Pricing Teaser & CTA

As a potential user,
I want to see pricing plans at a glance on the landing page,
So that I can understand costs before exploring further.

### Acceptance Criteria

1. Pricing teaser section displays all 4 plans: Free, Pro, Premium, Custom
2. Each plan shows: name, price, key feature (e.g., "5 surveys", "50 surveys", "Unlimited")
3. Simplified cards (less detail than full pricing page)
4. CTA on each card: "Get Started", "Subscribe", "Contact Us"
5. Section heading: "Choose the perfect plan for your needs" (i18n: `Landing.pricing_teaser_heading`)
6. "View Full Pricing" link navigates to /pricing (i18n: `Landing.view_full_pricing`)
7. Responsive grid: 1 column mobile, 2x2 or 4 columns desktop
8. Current plan highlighted for authenticated users
9. All plan names, prices, and CTAs fully translated

---

## Story 7.6: Landing Page - Final CTA Section

As a potential user,
I want to see a final call-to-action before the footer,
So that I'm encouraged to sign up after reviewing the page.

### Acceptance Criteria

1. Final CTA section with bold headline: "Ready to create your first survey?" (i18n: `Landing.final_cta_heading`)
2. Supporting text: "Join thousands of users collecting valuable insights" (i18n: `Landing.final_cta_subheading`)
3. Large CTA button: "Get Started Free - No Credit Card Required" (i18n: `Landing.get_started_no_cc`)
4. Section uses contrasting background color or gradient
5. Centered content with ample padding
6. Button links to /register
7. Mobile-optimized with full-width button on small screens
8. All CTA copy fully translated

---

## Story 7.7: Features/Services Page

As a potential user,
I want to see detailed explanations of all platform features,
So that I can fully understand capabilities before signing up.

### Acceptance Criteria

1. Features page created at /features with public access
2. Page hero: "Powerful features for modern surveys" (i18n: `Features.hero_heading`)
3. Features organized into categories: Survey Creation, Distribution, Analytics, Collaboration
4. **Survey Creation** section: drag-and-drop builder, question types, templates, conditional logic
5. **Distribution** section: shareable links, embed codes, QR codes
6. **Analytics** section: real-time responses, charts, data export, filtering
7. **Collaboration** section: organizations, roles/permissions, member management
8. Each feature includes: icon, heading, detailed description, screenshot/mockup
9. Features displayed in alternating left-right layout (image-text, text-image)
10. Page includes FAQ section answering common feature questions
11. CTA at bottom: "See all features in action - Start Free" (i18n: `Features.cta`)
12. Mobile-responsive with stacked layout
13. All feature headings, descriptions, and CTAs fully translated

---

## Story 7.8: About Page

As a potential user,
I want to learn about the company and mission,
So that I can understand who's behind the platform and why it exists.

### Acceptance Criteria

1. About page created at /about with public access
2. Page hero: "About Survey Platform" with mission statement (i18n: `About.hero_heading`, `About.mission`)
3. Mission: "We're on a mission to make survey creation accessible to everyone"
4. Story section: background on why the platform was created
5. Values section: 3-4 core values (e.g., "User-First Design", "Data Privacy", "Simplicity", "Innovation")
6. Team section: founder/team member cards with photos, names, titles (optional)
7. Technology section: highlights tech stack (Next.js, React, TypeScript, PostgreSQL)
8. Contact CTA: "Want to learn more? Get in touch" links to /contact (i18n: `About.contact_cta`)
9. Page includes decorative elements and brand imagery
10. Mobile-responsive layout
11. All copy, values, and CTAs fully translated

---

## Story 7.9: Contact Page & Form

As a potential user or customer,
I want to contact the team with questions or inquiries,
So that I can get personalized support or sales assistance.

### Acceptance Criteria

1. Contact page created at /contact with public access
2. Page hero: "Get in Touch" with subheading (i18n: `Contact.hero_heading`, `Contact.hero_subheading`)
3. Contact form includes fields: Name, Email, Subject, Message (all i18n labeled)
4. Subject dropdown options: "General Inquiry", "Sales/Custom Plan", "Support", "Partnership" (all i18n)
5. Form validation: all fields required, email format validated
6. API endpoint created (POST /api/contact) to handle submissions
7. Form submission sends email to support team
8. Auto-reply email sent to user confirming receipt (both EN/FR templates)
9. Success message after submission: "Thanks! We'll get back to you within 24 hours" (i18n: `Contact.success_message`)
10. Contact information displayed: email (support@survey.fatihoune.com), location (optional)
11. Social media links: LinkedIn, Twitter, GitHub (optional)
12. CAPTCHA or rate limiting to prevent spam
13. Mobile-responsive form layout
14. All form labels, options, and messages fully translated

---

## Story 7.10: Blog Foundation & First Post

As a potential user,
I want to read helpful content about surveys and data collection,
So that I can learn best practices and see the platform's expertise.

### Acceptance Criteria

1. Blog listing page created at /blog with public access
2. Blog post detail page at /blog/[slug]
3. Blog posts stored in database with BlogPost model: id, title, slug, excerpt, content, authorId, publishedAt, tags, createdAt
4. Admin page at /admin/blog for creating/editing posts (owner-only access)
5. Blog listing displays posts in grid: thumbnail, title, excerpt, date, author
6. Pagination for blog posts (10 per page)
7. First blog post: "5 Best Practices for Creating Effective Surveys" (i18n title/content)
8. Second blog post: "How to Increase Survey Response Rates" (i18n title/content)
9. Blog posts support Markdown formatting
10. Each post includes SEO metadata (title, description, OG tags)
11. Share buttons on blog posts (Twitter, LinkedIn, email)
12. Mobile-responsive blog layout
13. All blog UI labels and navigation fully translated

---

## Story 7.11: Footer & Navigation

As a user navigating the website,
I want a consistent footer and navigation across all pages,
So that I can easily access different sections.

### Acceptance Criteria

1. Global navigation bar includes: Logo (links to /), Features, Pricing, About, Blog, Contact
2. Authenticated users see additional nav items: Dashboard, Billing, Account
3. Nav includes CTA: "Sign Up" and "Log In" for unauthenticated users (i18n)
4. Nav is sticky at top of page with background blur on scroll
5. Mobile navigation collapses into hamburger menu
6. Footer includes 4 columns: Product, Company, Resources, Legal
7. **Product** column: Features, Pricing, Templates, Integrations (i18n)
8. **Company** column: About, Blog, Contact, Careers (i18n)
9. **Resources** column: Documentation, Help Center, API, Status Page (i18n)
10. **Legal** column: Privacy Policy, Terms of Service, Cookie Policy (i18n)
11. Footer includes social media icons and copyright notice
12. Footer displays language selector (EN/FR toggle)
13. All navigation labels and footer links fully translated

---

## Story 7.12: SEO Optimization & Meta Tags

As a website owner,
I want the website optimized for search engines,
So that potential users can discover the platform through Google searches.

### Acceptance Criteria

1. Each page includes unique meta title and description
2. Landing page title: "Survey Platform - Create Beautiful Surveys in Minutes"
3. Landing page description: "Modern survey tool for creating, distributing, and analyzing surveys. Free plan available. No credit card required."
4. Open Graph tags added for social media sharing (og:title, og:description, og:image)
5. Twitter Card meta tags for Twitter sharing
6. Canonical URLs set for all pages
7. Structured data (JSON-LD) added for Organization, Product, FAQPage
8. Sitemap.xml generated at /sitemap.xml with all public pages
9. Robots.txt configured to allow indexing
10. Next.js metadata API used for all pages
11. Dynamic OG images generated for blog posts
12. Page load speed optimized (< 2s initial load)
13. All meta content localized for EN/FR versions

---

## Story 7.13: Analytics & Tracking Integration

As a website owner,
I want to track user behavior and conversions,
So that I can optimize marketing and improve conversion rates.

### Acceptance Criteria

1. Google Analytics 4 (GA4) integrated with tracking ID in .env
2. GA4 tracking script loaded on all public pages
3. Custom events tracked: sign_up, subscription_start, survey_created
4. PostHog or Mixpanel integrated for product analytics
5. Conversion goals configured: registration, first survey, paid subscription
6. UTM parameters tracked for marketing campaigns
7. Privacy-compliant tracking with cookie consent banner
8. Cookie banner allows users to accept/reject analytics cookies (i18n: `Privacy.cookie_banner`)
9. Analytics opt-out respected (localStorage flag)
10. Tracking respects Do Not Track (DNT) browser setting
11. Dashboard for viewing key metrics (admin-only access)
12. All tracking notices and consent UI fully translated

---

## Story 7.14: Performance Optimization

As a website visitor,
I want pages to load quickly and smoothly,
So that I have a great browsing experience.

### Acceptance Criteria

1. Next.js static generation used for landing, pricing, features, about pages
2. Images optimized with Next.js Image component (WebP format, lazy loading)
3. Critical CSS inlined for above-the-fold content
4. Non-critical CSS and JS deferred
5. Font optimization with next/font (local fonts, preload)
6. Code splitting implemented (separate bundles for marketing vs. app)
7. Lighthouse performance score > 90 for landing page
8. Lighthouse accessibility score > 95
9. Core Web Vitals pass: LCP < 2.5s, FID < 100ms, CLS < 0.1
10. CDN configured for static assets (images, CSS, JS)
11. Gzip/Brotli compression enabled
12. Browser caching headers configured
13. Service worker for offline support (optional)

---

## Story 7.15: Legal Pages - Privacy Policy & Terms of Service

As a user,
I want to read the privacy policy and terms of service,
So that I understand how my data is used and the rules of using the platform.

### Acceptance Criteria

1. Privacy Policy page created at /privacy with public access
2. Privacy Policy includes sections: Data Collection, Data Usage, Data Storage, User Rights, Cookies, Third-Party Services
3. Privacy Policy complies with GDPR and CCPA requirements
4. Privacy Policy explains Stripe payment processing data handling
5. Terms of Service page created at /terms with public access
6. Terms of Service includes sections: Acceptance, User Accounts, Subscription & Billing, User Content, Prohibited Uses, Limitation of Liability, Termination
7. Terms explicitly address subscription cancellation and refund policy
8. Cookie Policy page created at /cookies with public access
9. Cookie Policy lists all cookies used (analytics, authentication, preferences)
10. All legal pages include "Last Updated" date
11. Legal pages accessible from footer links
12. Mobile-responsive layout with table of contents navigation
13. All legal content available in EN/FR (professionally translated)

---

## Story 7.16: Multi-language Support & Locale Switching

As a user,
I want to view the website in my preferred language (English or French),
So that I can understand content in my native language.

### Acceptance Criteria

1. next-intl or next-i18next integrated for internationalization
2. Language selector in footer and navigation bar
3. All marketing pages support EN and FR locales
4. URL structure: /en/pricing and /fr/pricing (or domain-based)
5. Language preference stored in cookie or localStorage
6. Language auto-detected from browser Accept-Language header
7. Language switcher preserves current page (e.g., /en/about → /fr/about)
8. All UI strings externalized to en.json and fr.json
9. SEO optimized with hreflang tags for language variants
10. Date and number formatting localized (e.g., 1,234.56 vs 1 234,56)
11. Currency displayed correctly (USD for EN, EUR for FR if applicable)
12. Professional translation review for all FR content
13. Language toggle includes flag icons and language names

---

## Story 7.17: Email Templates - Marketing & Transactional

As a user,
I want to receive professional, branded emails from the platform,
So that all communication feels cohesive and trustworthy.

### Acceptance Criteria

1. Email service configured (Resend or SendGrid) with API keys
2. React Email or MJML used for HTML email templates
3. **Welcome Email** template: sent on registration with getting started tips (EN/FR)
4. **Trial Expiring Email** template: sent 3 days before trial ends (EN/FR)
5. **Subscription Confirmation** email: sent after successful payment (EN/FR)
6. **Payment Failed** email: sent when payment fails with retry instructions (EN/FR)
7. **Contact Form** auto-reply: confirms inquiry received (EN/FR)
8. **Organization Invitation** email: sent when user invited to org (EN/FR) - already exists from Epic 5
9. All emails include header with logo and footer with unsubscribe link
10. Emails use brand colors and styling
11. Emails are mobile-responsive
12. Plain text version included for all emails
13. Unsubscribe functionality implemented (except critical transactional emails)
14. Email sending tracked (delivery, opens, clicks) via SendGrid/Resend dashboard

---

## Story 7.18: 404 & Error Pages

As a user,
I want helpful error pages when something goes wrong,
So that I can navigate back or understand the issue.

### Acceptance Criteria

1. Custom 404 page created at app/not-found.tsx
2. 404 page includes message: "Page not found" with friendly copy (i18n: `Errors.404_message`)
3. 404 page includes search bar to find content
4. 404 page includes links to: Home, Pricing, Features, Contact
5. 404 page includes CTA: "Get Started" if unauthenticated
6. 500 error page created at app/error.tsx
7. 500 page message: "Something went wrong" with apology and retry button (i18n: `Errors.500_message`)
8. 500 page logs error to monitoring service (Sentry)
9. Error pages match site branding and design
10. Error pages are mobile-responsive
11. All error messages and CTAs fully translated

---

## Checklist Summary

**Epic 7 delivers:**
- ✅ Professional landing page with hero, features, testimonials, pricing teaser
- ✅ Detailed features/services page showcasing all capabilities
- ✅ About page with mission, values, and team
- ✅ Contact form with email handling
- ✅ Blog foundation with first 2 posts
- ✅ Consistent navigation and footer across all pages
- ✅ SEO optimization with meta tags, structured data, sitemap
- ✅ Analytics integration (GA4, PostHog/Mixpanel)
- ✅ Performance optimization (> 90 Lighthouse score)
- ✅ Legal pages (Privacy Policy, Terms of Service, Cookie Policy)
- ✅ Multi-language support (EN/FR) with locale switching
- ✅ Professional email templates for all communication
- ✅ Custom 404 and 500 error pages
- ✅ Full internationalization for all marketing content

**Marketing Website Complete** - Platform now has a professional public presence to drive user acquisition and conversions!

---

## Epic Dependencies

**Epic 7 depends on:**
- Epic 1 (Authentication) - for user registration links
- Epic 6 (Subscriptions) - for pricing page integration

**Epic 7 enables:**
- User acquisition through organic search
- Professional brand presence
- Clear communication of value proposition
- Lead generation for Custom/Enterprise plans
- Content marketing through blog
- Multi-language market expansion (EN/FR)
