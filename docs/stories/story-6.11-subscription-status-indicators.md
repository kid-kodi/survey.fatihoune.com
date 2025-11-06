# Story 6.11: Subscription Status Indicators

**Status**: ✅ Ready for Review
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.11
**Date Created**: 2025-11-05
**Estimated Effort**: 5-6 hours

---

## 📋 Story Overview

**User Story**:
As a user, I want to see my subscription status throughout the application, so that I'm always aware of my plan limits and can upgrade when needed.

**Business Value**:
Visible subscription indicators increase awareness of plan limits and create natural upgrade opportunities. Clear status displays reduce user confusion and support inquiries.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)
- ✅ Story 6.4-6.6: Limits Enforcement (REQUIRED)
- ✅ Story 6.8: Upgrade Flow (REQUIRED)

---

## ✅ Acceptance Criteria

**Navigation Badge:**
1. Navigation bar displays current plan badge: "Free", "Pro", or "Premium" (i18n: `Subscription.[plan]_plan`)

**Dashboard Widgets:**
2. Dashboard displays usage widgets: surveys, organizations, members (with limits)
3. Usage widgets show progress bars or fractions (e.g., "3 of 5 surveys")
4. Widgets turn yellow at 80% usage, red at 100%

**Limit Alerts:**
5. Limit reached shows alert banner with upgrade CTA (i18n: `Subscription.limit_reached_banner`)
6. Survey creation page displays remaining survey count
7. Organization creation flow shows organization allowance
8. Member invitation modal shows remaining member slots

**Payment Status:**
9. "past_due" subscription status shows urgent payment warning (i18n: `Subscription.payment_failed_warning`)
10. Warning blocks new survey/org creation until payment resolved

**Internationalization:**
11. All plan badges and usage indicators fully translated

---

## 🏗️ Technical Implementation

See full implementation details in file.

---

## 📝 Implementation Tasks

- [x] Create PlanBadge component for navigation
- [x] Create UsageWidget component for dashboard
- [x] Create LimitReachedBanner component
- [x] Create PaymentWarningBanner component
- [x] Add usage displays to all creation flows
- [x] Add i18n translations
- [x] Test all indicator colors and states
- [x] Test responsive layouts

---

## 🎯 Definition of Done

- [x] Plan badge visible in navigation
- [x] Usage widgets on dashboard
- [x] Progress bars show correct colors
- [x] Limit banners display at 100%
- [x] Payment warnings show for past_due
- [x] All translations added
- [x] Mobile responsive
- [x] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.1, Story 6.4-6.6, Story 6.8
- **Related**: Story 6.10 (Billing Dashboard)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📋 Dev Agent Record

### Agent Model Used
- Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Completion Notes
- Created PlanBadge component showing Free/Pro/Premium status in navigation
- Implemented 3 UsageWidget components (Survey, Organization, Member) for dashboard
- Widgets display usage fractions and progress bars with color coding (green < 80%, yellow >= 80%, red >= 100%)
- Created LimitReachedBanner for displaying limit alerts with upgrade CTA
- Created PaymentWarningBanner for past_due subscription status
- Added usage indicators to survey creation page, organization creation modal, and member invitation modal
- Implemented 3 API endpoints: /api/usage/organizations, /api/usage/members, /api/user/subscription-status
- Added comprehensive i18n translations in English and French
- All components are mobile responsive and follow existing design patterns
- TypeScript type checking passes
- ESLint passes for all new files

### File List
**Components:**
- components/subscription/PlanBadge.tsx (new)
- components/subscription/OrganizationUsageWidget.tsx (new)
- components/subscription/MemberUsageWidget.tsx (new)
- components/subscription/SurveyUsageWidget.tsx (modified)
- components/subscription/LimitReachedBanner.tsx (new)
- components/subscription/PaymentWarningBanner.tsx (new)
- components/organizations/CreateOrganizationModal.tsx (modified)
- components/organizations/InviteMemberModal.tsx (modified)

**API Routes:**
- app/api/usage/organizations/route.ts (new)
- app/api/usage/members/route.ts (new)
- app/api/user/subscription-status/route.ts (new)

**Pages:**
- app/dashboard/page.tsx (modified)
- app/surveys/new/page.tsx (modified)

**Translations:**
- messages/en.json (modified)
- messages/fr.json (modified)
