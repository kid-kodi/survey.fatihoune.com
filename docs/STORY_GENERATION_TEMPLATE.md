# Story Generation Template & Guide

**Purpose**: This document provides templates and summaries for generating all remaining Epic 6 and Epic 7 story files.

**Created**: 2025-11-05
**Status**: Active Template

---

## ✅ Completed Story Files (Examples)

The following stories have been created as detailed examples:

1. ✅ **Story 6.1** - Database Schema for Subscriptions (Multi-Payment Provider)
2. ✅ **Story 6.2** - Stripe Integration Setup
3. ✅ **Story 6.3** - Stripe Webhook Handler
4. ✅ **Story 6.4** - Survey Limits Enforcement
5. ✅ **Story 6.7** - Pricing Page UI

These serve as reference implementations for creating the remaining stories.

---

## 📋 Story Template Structure

Use this template for all remaining stories:

```markdown
# Story [NUMBER]: [TITLE]

**Status**: 📝 Draft
**Epic**: Epic [6 or 7] - [Epic Name]
**Story Number**: [X.Y]
**Date Created**: 2025-11-05
**Estimated Effort**: [X-Y hours]

---

## 📋 Story Overview

**User Story**:
As a [role], I want [feature], so that [benefit].

**Business Value**:
[Why this story matters for the business/product]

**Dependencies**:
- [List prerequisite stories or mark as "None"]

**Blocks**:
- [Stories that depend on this one]

---

## ✅ Acceptance Criteria

1. [Specific, testable criterion]
2. [Another criterion]
3. [etc.]

---

## 🏗️ Technical Implementation

[Key code snippets, API routes, components, or architectural notes]

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] [etc.]

---

## 📝 Implementation Tasks

- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [etc.]

---

## 🎯 Definition of Done

- [ ] [DoD item 1]
- [ ] [DoD item 2]
- [ ] [etc.]

---

## 🔗 Related Stories

- **Depends On**: [Story numbers]
- **Blocks**: [Story numbers]
- **Related**: [Story numbers]
- **Epic**: Epic [X] - [Name]

---

## 🤖 Dev Agent Record

### Agent Model Used
- **Model**: TBD

### Implementation Summary
- **Status**: Not started

### File List
- TBD

### Completion Notes
- TBD
```

---

## 📊 Remaining Epic 6 Stories Summary

### Story 6.3b: Wave Integration Setup
- **Effort**: 4-5 hours
- **User Story**: As a developer, I want to integrate Wave payment processing, so that West African users can subscribe using mobile money.
- **Key Features**: Wave API integration, XOF currency, mobile money checkout, webhook handling
- **Dependencies**: Story 6.1
- **File**: `docs/stories/story-6.3b-wave-integration.md`

### Story 6.3c: Orange Money Integration Setup
- **Effort**: 4-5 hours
- **User Story**: As a developer, I want to integrate Orange Money payment processing, so that users across francophone Africa can subscribe.
- **Key Features**: Orange Money API, OAuth2, SMS OTP flow, XOF currency
- **Dependencies**: Story 6.1
- **File**: `docs/stories/story-6.3c-orange-money-integration.md`

### Story 6.3d: Wave Webhook Handler
- **Effort**: 2-3 hours
- **User Story**: As a developer, I want to handle Wave webhook events, so that Wave subscription changes are reflected in real-time.
- **Key Features**: Webhook signature verification, payment events, subscription events
- **Dependencies**: Story 6.3b
- **File**: `docs/stories/story-6.3d-wave-webhook-handler.md`

### Story 6.3e: Orange Money Webhook Handler
- **Effort**: 2-3 hours
- **User Story**: As a developer, I want to handle Orange Money webhooks with polling fallback, so that Orange Money subscription changes sync reliably.
- **Key Features**: Webhook handling, polling fallback, exponential backoff
- **Dependencies**: Story 6.3c
- **File**: `docs/stories/story-6.3e-orange-webhook-handler.md`

### Story 6.5: Organization Limits Enforcement
- **Effort**: 2-3 hours
- **User Story**: As a user, I want organization creation limits enforced based on my plan, so that Free users can't create orgs and Pro users are limited to 1.
- **Key Features**: Organization limit check, usage tracking, upgrade CTAs
- **Dependencies**: Story 6.1, Story 6.4 (similar pattern)
- **File**: `docs/stories/story-6.5-organization-limits.md`

### Story 6.6: Member Limits Enforcement
- **Effort**: 2-3 hours
- **User Story**: As an organization owner, I want member invitation limits enforced, so that Pro organizations can't exceed 5 members.
- **Key Features**: Member limit check, pending invitation counting, usage tracking
- **Dependencies**: Story 6.1, Story 6.4 (similar pattern)
- **File**: `docs/stories/story-6.6-member-limits.md`

### Story 6.8: Subscription Upgrade Flow
- **Effort**: 3-4 hours
- **User Story**: As a Free/Pro user, I want to upgrade to a higher tier, so that I can access more features.
- **Key Features**: Upgrade button, checkout flow, success page, immediate feature access
- **Dependencies**: Story 6.2, Story 6.3
- **File**: `docs/stories/story-6.8-upgrade-flow.md`

### Story 6.9: Subscription Downgrade Flow
- **Effort**: 3-4 hours
- **User Story**: As a Pro/Premium user, I want to downgrade to save costs, so I can adjust my plan based on usage.
- **Key Features**: Customer portal, downgrade scheduling, usage warnings, limit enforcement
- **Dependencies**: Story 6.2, Story 6.3
- **File**: `docs/stories/story-6.9-downgrade-flow.md`

### Story 6.10: Billing Dashboard & Payment History
- **Effort**: 4-5 hours
- **User Story**: As a subscribed user, I want to view my subscription and payment history, so I can track my billing.
- **Key Features**: Current plan display, payment method, payment history, invoices, cancellation
- **Dependencies**: Story 6.2, Story 6.3
- **File**: `docs/stories/story-6.10-billing-dashboard.md`

### Story 6.11: Subscription Status Indicators
- **Effort**: 3-4 hours
- **User Story**: As a user, I want to see my subscription status throughout the app, so I'm always aware of my limits.
- **Key Features**: Plan badges, usage widgets, progress bars, limit alerts, past_due warnings
- **Dependencies**: Story 6.1, Story 6.4, Story 6.5, Story 6.6
- **File**: `docs/stories/story-6.11-status-indicators.md`

### Story 6.12: Contact Form for Custom Plan
- **Effort**: 2-3 hours
- **User Story**: As an enterprise customer, I want to contact sales for a custom plan, so I can discuss enterprise requirements.
- **Key Features**: Contact form, email sending, CAPTCHA, auto-reply
- **Dependencies**: Story 6.1, Story 6.7
- **File**: `docs/stories/story-6.12-custom-plan-contact.md`

### Story 6.13: Grandfathering & Plan Migration
- **Effort**: 3-4 hours
- **User Story**: As a developer, I want to migrate existing users to subscription plans, so rollout doesn't disrupt current users.
- **Key Features**: Migration script, grace periods, user notifications, rollback capability
- **Dependencies**: Story 6.1
- **File**: `docs/stories/story-6.13-plan-migration.md`

### Story 6.14: Trial Period for Pro Plan
- **Effort**: 3-4 hours
- **User Story**: As a new user, I want to try Pro free for 14 days, so I can evaluate features before paying.
- **Key Features**: Trial subscription, no payment required, trial countdown, auto-downgrade
- **Dependencies**: Story 6.1, Story 6.2
- **File**: `docs/stories/story-6.14-pro-trial.md`

### Story 6.15: Payment Provider Selection UI
- **Effort**: 3-4 hours
- **User Story**: As a user upgrading, I want to choose my preferred payment method (Stripe/Wave/Orange Money), so I can pay conveniently.
- **Key Features**: Provider selector, location-based suggestions, currency auto-selection
- **Dependencies**: Story 6.2, Story 6.3b, Story 6.3c
- **File**: `docs/stories/story-6.15-provider-selection-ui.md`

### Story 6.16: Multi-Currency Pricing Display
- **Effort**: 3-4 hours
- **User Story**: As a user, I want to see prices in my local currency, so I understand costs in familiar terms.
- **Key Features**: Currency selector, auto-detection, locale-specific formatting, exchange rate display
- **Dependencies**: Story 6.1, Story 6.7
- **File**: `docs/stories/story-6.16-multi-currency-display.md`

---

## 📊 Remaining Epic 7 Stories Summary

### Story 7.1: Landing Page - Hero Section
- **Effort**: 3-4 hours
- **Key Features**: Hero headline, CTA buttons, hero image, social proof
- **File**: `docs/stories/story-7.1-landing-hero.md`

### Story 7.2: Landing Page - Features Section
- **Effort**: 2-3 hours
- **Key Features**: 6 feature cards with icons, grid layout, responsive
- **File**: `docs/stories/story-7.2-landing-features.md`

### Story 7.3: Landing Page - How It Works Section
- **Effort**: 2-3 hours
- **Key Features**: 4-step process, numbered steps, CTA
- **File**: `docs/stories/story-7.3-landing-how-it-works.md`

### Story 7.4: Landing Page - Testimonials Section
- **Effort**: 2-3 hours
- **Key Features**: 3 testimonials, avatars, carousel/grid
- **File**: `docs/stories/story-7.4-landing-testimonials.md`

### Story 7.5: Landing Page - Pricing Teaser & CTA
- **Effort**: 2-3 hours
- **Key Features**: Simplified plan cards, pricing teaser, link to full pricing
- **File**: `docs/stories/story-7.5-landing-pricing-teaser.md`

### Story 7.6: Landing Page - Final CTA Section
- **Effort**: 1-2 hours
- **Key Features**: Bold CTA, no credit card message, gradient background
- **File**: `docs/stories/story-7.6-landing-final-cta.md`

### Story 7.7: Features/Services Page
- **Effort**: 4-5 hours
- **Key Features**: Detailed feature descriptions, categories, screenshots, FAQ
- **File**: `docs/stories/story-7.7-features-page.md`

### Story 7.8: About Page
- **Effort**: 3-4 hours
- **Key Features**: Mission, values, team, technology stack, contact CTA
- **File**: `docs/stories/story-7.8-about-page.md`

### Story 7.9: Contact Page & Form
- **Effort**: 3-4 hours
- **Key Features**: Contact form, subject dropdown, email sending, CAPTCHA
- **File**: `docs/stories/story-7.9-contact-page.md`

### Story 7.10: Blog Foundation & First Posts
- **Effort**: 5-6 hours
- **Key Features**: Blog listing, blog post page, admin interface, Markdown support
- **File**: `docs/stories/story-7.10-blog-foundation.md`

### Story 7.11: Footer & Navigation
- **Effort**: 3-4 hours
- **Key Features**: Global nav, footer columns, language selector, sticky nav
- **File**: `docs/stories/story-7.11-footer-navigation.md`

### Story 7.12: SEO Optimization & Meta Tags
- **Effort**: 3-4 hours
- **Key Features**: Meta tags, OG tags, sitemap.xml, robots.txt, structured data
- **File**: `docs/stories/story-7.12-seo-optimization.md`

### Story 7.13: Analytics & Tracking Integration
- **Effort**: 3-4 hours
- **Key Features**: GA4, PostHog/Mixpanel, custom events, cookie consent banner
- **File**: `docs/stories/story-7.13-analytics-tracking.md`

### Story 7.14: Performance Optimization
- **Effort**: 4-5 hours
- **Key Features**: Static generation, image optimization, code splitting, Lighthouse > 90
- **File**: `docs/stories/story-7.14-performance-optimization.md`

### Story 7.15: Legal Pages - Privacy, Terms, Cookies
- **Effort**: 4-5 hours
- **Key Features**: Privacy policy, Terms of Service, Cookie policy, GDPR compliance
- **File**: `docs/stories/story-7.15-legal-pages.md`

### Story 7.16: Multi-Language Support & Locale Switching
- **Effort**: 4-5 hours
- **Key Features**: next-intl, language selector, URL structure, hreflang tags
- **File**: `docs/stories/story-7.16-multi-language-support.md`

### Story 7.17: Email Templates - Marketing & Transactional
- **Effort**: 4-5 hours
- **Key Features**: Welcome, trial expiring, subscription confirmation, payment failed emails
- **File**: `docs/stories/story-7.17-email-templates.md`

### Story 7.18: 404 & Error Pages
- **Effort**: 2-3 hours
- **Key Features**: Custom 404 page, 500 error page, helpful navigation
- **File**: `docs/stories/story-7.18-error-pages.md`

---

## 🚀 Quick Generation Instructions

### For Each Story:

1. **Copy the template above**
2. **Replace placeholders** with story-specific information from the summary tables
3. **Extract acceptance criteria** from `docs/prd/epic-6-subscription-billing.md` or `docs/prd/epic-7-marketing-website.md`
4. **Add technical implementation** details based on the epic documentation
5. **Create testing checklist** based on acceptance criteria
6. **Save file** with naming convention: `story-[number]-[slug].md`

### Example Workflow:

For **Story 6.5 (Organization Limits)**:

1. Copy template
2. Title: "Story 6.5: Organization Limits Enforcement"
3. Extract AC from Epic 6 doc (lines 244-264)
4. Add similar implementation pattern to Story 6.4
5. Create file: `docs/stories/story-6.5-organization-limits.md`

---

## 📦 Batch Creation Recommendation

Create stories in these logical groups:

**Group 1: Payment Providers** (Mobile Money)
- Stories 6.3b, 6.3c, 6.3d, 6.3e

**Group 2: Usage Limits** (Similar Pattern)
- Stories 6.5, 6.6

**Group 3: Billing UI & Flows**
- Stories 6.8, 6.9, 6.10, 6.11

**Group 4: Subscription Features**
- Stories 6.12, 6.13, 6.14, 6.15, 6.16

**Group 5: Landing Page** (Epic 7)
- Stories 7.1, 7.2, 7.3, 7.4, 7.5, 7.6

**Group 6: Marketing Pages** (Epic 7)
- Stories 7.7, 7.8, 7.9, 7.10, 7.11

**Group 7: Technical Marketing** (Epic 7)
- Stories 7.12, 7.13, 7.14

**Group 8: Final Polish** (Epic 7)
- Stories 7.15, 7.16, 7.17, 7.18

---

## 📝 Notes

- All Epic 6 and Epic 7 content is available in:
  - `docs/prd/epic-6-subscription-billing.md`
  - `docs/prd/epic-7-marketing-website.md`
- Reference completed stories (6.1-6.4, 6.7) for implementation patterns
- Maintain consistent formatting across all stories
- Update DoD checklist specific to each story's requirements

---

**Total Stories to Create**: 33 remaining
**Estimated Time Per Story**: 15-30 minutes using template
**Total Generation Time**: ~8-16 hours

---

*Template created by: James (Dev Agent)*
*Date: 2025-11-05*
*Status: Ready for use*
