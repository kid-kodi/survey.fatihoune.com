# Story 6.15: Payment Provider Selection UI

**Status**: ✅ Ready for Review
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.15
**Date Created**: 2025-11-05
**Estimated Effort**: 5-6 hours

---

## 📋 Story Overview

**User Story**:
As a user upgrading to a paid plan, I want to choose my preferred payment method (Stripe, Wave, or Orange Money), so that I can pay using my most convenient payment option.

**Business Value**:
Offering multiple payment methods increases conversion rates, especially in African markets where mobile money dominates. Localized payment options reduce friction and maximize revenue.

**Dependencies**:
- ✅ Story 6.2: Stripe Integration (REQUIRED)
- ✅ Story 6.3b: Wave Integration (REQUIRED)
- ✅ Story 6.3c: Orange Money Integration (REQUIRED)
- ✅ Story 6.7: Pricing Page UI (REQUIRED)

---

## ✅ Acceptance Criteria

**Payment Method Selector:**
1. Pricing page displays payment method selector with 3 options
2. **Option 1**: Credit/Debit Card (Stripe) - with Visa, Mastercard, Amex logos
3. **Option 2**: Wave (Mobile Money) - with Wave logo and "Senegal, CI, Mali, Burkina" label
4. **Option 3**: Orange Money - with Orange Money logo and "17+ African countries" label

**User Preference:**
5. Payment method selection stored in User.preferredPaymentProvider
6. Currency automatically selected based on payment method:
   - Stripe → USD/EUR (user choice)
   - Wave → XOF
   - Orange Money → XOF

**Pricing Display:**
7. Pricing displayed in selected currency (e.g., "$29/mo" or "15,000 FCFA/mois")

**Location Auto-Detection:**
8. Location auto-detection suggests payment method:
   - African IPs → Default to Wave/Orange Money
   - Other IPs → Default to Stripe

**UI/UX:**
9. "Change payment method" link available on pricing page
10. Payment method icons visible on subscription upgrade button

**Checkout Routing:**
11. Checkout flow redirects to appropriate provider (Stripe Checkout, Wave, Orange)
12. All payment method labels and descriptions fully translated (EN/FR)

---

## 📝 Implementation Tasks

- [x] Create PaymentMethodSelector component
- [x] Add payment provider logos (Stripe, Wave, Orange)
- [x] Implement location-based auto-detection
- [x] Store preferredPaymentProvider in user preferences
- [x] Update pricing display based on selected method
- [x] Route checkout to correct provider
- [x] Add currency conversion for display
- [x] Add i18n translations (EN/FR)
- [x] Test all payment method selections
- [x] Test location-based defaults

---

## 🎯 Definition of Done

- [x] Payment method selector displayed on pricing page
- [x] All 3 providers visible with logos
- [x] Location-based defaults working
- [x] User preference stored correctly
- [x] Currency displayed correctly for each method
- [x] Checkout routing works for all providers
- [x] All translations added
- [x] Mobile responsive design
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.2 (Stripe), Story 6.3b (Wave), Story 6.3c (Orange Money), Story 6.7 (Pricing Page)
- **Related**: Story 6.16 (Multi-Currency Pricing), Story 6.8 (Upgrade Flow)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📋 Dev Agent Record

### Agent Model Used
- claude-sonnet-4-5-20250929

### Completion Notes
- Created PaymentMethodSelector component with support for Stripe, Wave, and Orange Money
- Implemented location-based auto-detection using ipapi.co service
- Added currency conversion utilities (USD, EUR, XOF) with proper formatting
- Integrated payment method selection into PricingCards component
- Updated pricing display to show converted prices based on selected currency
- Added API endpoint for storing user payment preferences
- Checkout routing already supported payment provider parameter
- Added comprehensive i18n translations for EN and FR
- All code passes TypeScript compilation and ESLint checks
- Mobile responsive design using Tailwind CSS grid system

### File List
- components/pricing/PaymentMethodSelector.tsx (NEW)
- components/pricing/PricingCards.tsx (MODIFIED)
- lib/utils/location-detection.ts (NEW)
- lib/utils/currency.ts (NEW)
- app/api/user/preferences/route.ts (NEW)
- messages/en.json (MODIFIED)
- messages/fr.json (MODIFIED)
