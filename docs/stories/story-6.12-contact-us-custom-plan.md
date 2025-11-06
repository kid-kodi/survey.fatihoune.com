# Story 6.12: Contact Us for Custom Plan

**Status**: ✅ Ready for Review
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.12
**Date Created**: 2025-11-05
**Estimated Effort**: 3-4 hours

---

## 📋 Story Overview

**User Story**:
As a potential enterprise customer, I want to contact the sales team for a custom plan, so that I can discuss enterprise requirements and pricing.

**Business Value**:
Enterprise customers require personalized sales outreach. A clear contact flow captures enterprise leads and enables high-value custom deals.

**Dependencies**:
- ✅ Story 6.7: Pricing Page UI (REQUIRED)
- ✅ Story 1.4: Email Service Integration (REQUIRED)

---

## ✅ Acceptance Criteria

**Contact Form:**
1. Custom plan card on pricing page includes "Contact Us" CTA
2. CTA navigates to /contact or opens contact modal
3. Contact form includes fields: name, email, company, message (all i18n labeled)
4. Form includes dropdown: "Interested in Custom/Enterprise plan" pre-selected

**Email Delivery:**
5. Form submission sends email to sales team via API (POST /api/contact)
6. Email includes all form details and timestamp
7. Success message shown after submission (i18n: `Contact.message_sent`)
8. Email sent to user confirming inquiry received

**Security & Validation:**
9. Error handling for failed email delivery
10. Form validation prevents empty submissions
11. CAPTCHA or rate limiting prevents spam

**Internationalization:**
12. All form labels and messages fully translated

---

## 📝 Implementation Tasks

- [x] Create /contact page or modal
- [x] Create contact form with validation
- [x] Create POST /api/contact endpoint
- [x] Implement email sending to sales team
- [x] Implement confirmation email to user
- [x] Add CAPTCHA or rate limiting
- [x] Add i18n translations
- [x] Test email delivery
- [x] Test spam prevention

---

## 🎯 Definition of Done

- [x] Contact form accessible from pricing page
- [x] Form validation working
- [x] Emails sent to sales team
- [x] Confirmation emails sent to users
- [x] Spam prevention implemented
- [x] All translations added
- [x] Form tested with valid/invalid inputs
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.7 (Pricing Page), Story 1.4 (Email Service)
- **Related**: Story 7.x (Marketing pages)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📋 Dev Agent Record

### Agent Model Used
- claude-sonnet-4-5-20250929

### Completion Notes
- Implemented complete contact form flow for custom plan inquiries
- Created dedicated `/contact` page with comprehensive form including name, email, company, inquiry type, and message fields
- Implemented Zod validation schema in `lib/validation.ts` for form data validation
- Created API endpoint `POST /api/contact` with rate limiting (5 requests per minute per IP)
- Implemented two email templates:
  - ContactInquiryEmail: Sends detailed inquiry to sales team
  - ContactConfirmationEmail: Sends acknowledgment to user
- Rate limiting implemented using in-memory store (suitable for single-instance deployments)
- Full internationalization support added for English and French
- Added SALES_EMAIL environment variable to .env.example
- Pricing page already had routing to /contact for custom plan CTA (no changes needed)
- All linting and type checks passed successfully

### File List
- `app/contact/page.tsx` (NEW) - Contact form page with react-hook-form integration
- `app/api/contact/route.ts` (NEW) - API endpoint for handling contact submissions
- `lib/validation.ts` (NEW) - Zod validation schemas and rate limiting utilities
- `lib/email-templates/ContactInquiryEmail.tsx` (NEW) - Email template for sales team
- `lib/email-templates/ContactConfirmationEmail.tsx` (NEW) - Email template for user confirmation
- `messages/en.json` (MODIFIED) - Added Contact section with all form translations
- `messages/fr.json` (MODIFIED) - Added Contact section with French translations
- `.env.example` (MODIFIED) - Added SALES_EMAIL configuration
