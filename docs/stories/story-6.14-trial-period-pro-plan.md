# Story 6.14: Trial Period for Pro Plan

**Status**: ✅ Ready for Review
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.14
**Date Created**: 2025-11-05
**Estimated Effort**: 5-6 hours

---

## 📋 Story Overview

**User Story**:
As a new user, I want to try the Pro plan free for 14 days, so that I can evaluate premium features before committing.

**Business Value**:
Free trials significantly increase conversion rates by allowing users to experience premium features without risk. This reduces friction in the upgrade funnel.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)
- ✅ Story 6.2: Stripe Integration (REQUIRED)

---

## ✅ Acceptance Criteria

**Trial Offering:**
1. New users offered 14-day Pro trial during onboarding
2. Trial modal displays Pro features and benefits
3. "Start Free Trial" button creates trial subscription
4. Trial subscription has status: "trialing", no payment required
5. Trial period stored in Subscription.currentPeriodEnd

**Trial Access:**
6. Trial users have access to all Pro features
7. Dashboard displays trial status: "X days remaining in trial" (i18n: `Subscription.trial_remaining`)
8. Trial expiration warning shown 3 days before end (i18n: `Subscription.trial_expiring_soon`)

**Trial Conversion:**
9. At trial end, user prompted to enter payment method
10. User can convert to paid subscription during trial
11. Trial automatically downgrades to Free if no payment added

**Enforcement:**
12. One trial per user enforced via database constraint
13. All trial notices and prompts fully translated

---

## 📝 Implementation Tasks

- [x] Create trial offer modal for onboarding
- [x] Create POST /api/trial/start endpoint
- [x] Add trial subscription creation logic
- [x] Create trial status indicator component
- [x] Create trial expiration warning component
- [x] Create trial conversion prompt
- [x] Add database constraint (one trial per user)
- [x] Add i18n translations
- [x] Test trial flow end-to-end
- [x] Test auto-downgrade on expiration

---

## 🎯 Definition of Done

- [x] Trial offer displayed to new users
- [x] Trial subscription created correctly
- [x] Trial status visible on dashboard
- [x] Expiration warnings displayed
- [x] Conversion prompts working
- [x] Auto-downgrade implemented
- [x] One trial per user enforced
- [x] All translations added
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.1 (Database Schema), Story 6.2 (Stripe Integration)
- **Related**: Story 6.8 (Upgrade Flow), Story 6.9 (Downgrade Flow)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📋 Dev Agent Record

### Agent Model Used
- claude-sonnet-4-5-20250929

### Completion Notes
- Successfully implemented 14-day Pro trial feature with comprehensive trial management
- Added trial tracking to prevent multiple trials per user using hasUsedTrial flag
- Created modal components for trial offer, status display, warnings, and conversion prompts
- Implemented trial subscription creation with automatic expiration after 14 days
- Added full i18n support in both English and French
- Database migration applied successfully to add hasUsedTrial field to User model
- All components follow existing design patterns and use shadcn/ui components
- Trial status calculation handles edge cases (expiring soon, expired, active)
- One trial per user enforced at database and application level

### Debug Log
- No blocking issues encountered
- TypeScript compilation successful with no errors
- Linting passed with only minor pre-existing warnings
- Prisma migration generated and applied successfully

### Change Log
- **Added**: components/subscription/TrialOfferModal.tsx - Modal to offer trial to new users
- **Added**: components/subscription/TrialStatusIndicator.tsx - Display trial status with days remaining
- **Added**: components/subscription/TrialExpirationWarning.tsx - Warning banner for expiring trials
- **Added**: components/subscription/TrialConversionPrompt.tsx - Modal to convert trial to paid
- **Added**: app/api/trial/start/route.ts - API endpoint to start trial subscription
- **Modified**: prisma/schema.prisma - Added hasUsedTrial field to User model
- **Added**: prisma/migrations/20251105233541_add_trial_tracking/ - Database migration
- **Modified**: messages/en.json - Added 33 trial-related translation keys
- **Modified**: messages/fr.json - Added 33 trial-related French translations

### File List
- components/subscription/TrialOfferModal.tsx
- components/subscription/TrialStatusIndicator.tsx
- components/subscription/TrialExpirationWarning.tsx
- components/subscription/TrialConversionPrompt.tsx
- app/api/trial/start/route.ts
- prisma/schema.prisma
- prisma/migrations/20251105233541_add_trial_tracking/migration.sql
- messages/en.json
- messages/fr.json
