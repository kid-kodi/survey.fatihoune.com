# Epic 6: Subscription & Billing Management

**Epic Goal**: Transform the survey platform into a fully monetized SaaS offering with tiered subscription plans, integrated payment processing via **multiple payment providers** (Stripe, Wave, Orange Money), usage limit enforcement, and self-service billing management. This epic enables users to subscribe to Free, Pro, or Premium plans with automatic enforcement of survey limits, organization restrictions, and user caps. By the end of this epic, the platform supports revenue generation through subscriptions with flexible payment options for global (Stripe) and African markets (Wave, Orange Money), providing a seamless upgrade/downgrade experience.

---

## Overview

This epic introduces four subscription tiers with **multi-currency and multi-payment provider support**:

- **Free**: Up to 5 surveys per account, no organizations
- **Pro**: 1 organization, 5 users max, 10 surveys per user (50 total max)
  - **USD**: $29/month (Stripe - Global)
  - **XOF**: 15,000 FCFA/month (Wave, Orange Money - West Africa)
- **Premium**: Unlimited organizations, users, and surveys
  - **USD**: $99/month (Stripe - Global)
  - **XOF**: 50,000 FCFA/month (Wave, Orange Money - West Africa)
- **Custom**: Enterprise tier requiring contact (no self-service), custom pricing

**Payment Providers Supported**:
- **Stripe**: Global credit/debit cards, Apple Pay, Google Pay (USD, EUR)
- **Wave**: Mobile money for Senegal, Côte d'Ivoire, Burkina Faso, Mali (XOF/CFA Franc)
- **Orange Money**: Mobile money across francophone Africa (XOF/CFA Franc)

---

## Story 6.1: Database Schema - Subscriptions & Plans (Multi-Payment Provider)

As a developer,
I want to extend the database schema with subscription plans, user subscriptions, and usage tracking models supporting multiple payment providers,
So that the platform can support multi-tier subscription management with Stripe, Wave, and Orange Money.

### Acceptance Criteria

1. SubscriptionPlan model created with fields: id, name (Free/Pro/Premium/Custom), description, price, currency (USD/XOF/EUR), interval (month/year), stripeProductId, stripePriceId, waveProductId, orangeProductId, features (JSON), isActive, createdAt, updatedAt
2. Subscription model created with fields: id, userId, planId, status (active/cancelled/past_due/trialing), paymentProvider (stripe/wave/orange_money), providerSubscriptionId, providerCustomerId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt
3. Payment model created with fields: id, subscriptionId, userId, amount, currency, provider (stripe/wave/orange_money), providerPaymentId, status (pending/completed/failed), paidAt, createdAt
4. PlanLimit model created with fields: id, planId, limitType (surveys/organizations/users), limitValue (number or 'unlimited'), createdAt
5. UsageTracking model created with fields: id, userId, organizationId (nullable), resourceType (survey/organization/user), currentCount, lastUpdated
6. Default plans seeded with multi-currency support:
   - Free (5 surveys)
   - Pro-USD ($29/mo, Stripe)
   - Pro-XOF (15,000 FCFA/mo, Wave/Orange Money)
   - Premium-USD ($99/mo, Stripe)
   - Premium-XOF (50,000 FCFA/mo, Wave/Orange Money)
   - Custom (contact us)
7. PlanLimit records seeded for each plan with appropriate limits
8. User model extended with fields: currentPlanId, preferredCurrency (USD/XOF/EUR), preferredPaymentProvider (stripe/wave/orange_money)
9. Database migrations created and tested
10. Prisma schema updated and client regenerated
11. Indexes created on: userId, planId, providerSubscriptionId, providerCustomerId, paymentProvider
12. All users default to Free plan on registration
13. User currency preference auto-detected from browser/location on first visit

---

## Story 6.2: Stripe Integration Setup

As a developer,
I want to integrate Stripe payment processing into the platform,
So that users can subscribe to paid plans and manage billing.

### Acceptance Criteria

1. Stripe SDK installed (@stripe/stripe-js, stripe npm packages)
2. Stripe API keys configured in .env (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
3. Stripe products created for Pro and Premium plans in Stripe dashboard
4. Product IDs and Price IDs stored in SubscriptionPlan records
5. Stripe customer creation implemented when user upgrades from Free plan
6. User.stripeCustomerId updated when Stripe customer created
7. Stripe checkout session API route created (POST /api/billing/checkout)
8. Checkout session returns session URL for redirect
9. Success/cancel URLs configured for post-checkout flow
10. Stripe customer portal session API route created (POST /api/billing/portal)
11. Customer portal allows users to manage billing, payment methods, and subscriptions
12. Error handling for Stripe API failures with user-friendly messages

---

## Story 6.3: Stripe Webhook Handler

As a developer,
I want to handle Stripe webhook events to sync subscription status,
So that subscription changes are reflected in the database in real-time.

### Acceptance Criteria

1. Stripe webhook endpoint created (POST /api/webhooks/stripe)
2. Webhook signature verification implemented for security
3. Webhook handles event: checkout.session.completed (new subscription)
4. checkout.session.completed creates Subscription record with status 'active'
5. Webhook handles event: customer.subscription.updated (plan change, renewal)
6. customer.subscription.updated updates Subscription record fields
7. Webhook handles event: customer.subscription.deleted (cancellation)
8. customer.subscription.deleted updates Subscription status to 'cancelled'
9. Webhook handles event: invoice.payment_failed (payment issues)
10. invoice.payment_failed updates Subscription status to 'past_due'
11. invoice.payment_succeeded updates subscription period dates
12. Webhook logs all events for debugging
13. Webhook returns 200 OK for processed events, 400 for errors
14. Idempotency handling prevents duplicate processing

---

## Story 6.3b: Wave Integration Setup

As a developer,
I want to integrate Wave payment processing into the platform,
So that users in West Africa can subscribe using mobile money (Wave).

### Acceptance Criteria

1. Wave API SDK/library installed or custom HTTP client configured
2. Wave API credentials configured in .env (WAVE_API_KEY, WAVE_MERCHANT_ID, WAVE_WEBHOOK_SECRET)
3. Wave business account created and verified for Senegal/West Africa
4. Wave payment products created for Pro-XOF and Premium-XOF plans
5. Product IDs stored in SubscriptionPlan records (waveProductId)
6. Wave checkout API endpoint created (POST /api/billing/checkout/wave)
7. Checkout endpoint initiates Wave payment session with mobile money
8. User redirected to Wave payment page (mobile money number input)
9. Success/cancel URLs configured for post-payment flow
10. Wave payment confirmation handled via webhook
11. Subscription record created with paymentProvider='wave'
12. Error handling for Wave API failures with localized messages (FR)
13. Wave logo and branding displayed on payment selection page

**Technical Notes**:
- Wave API documentation: https://developer.wave.com
- Wave supports: Orange Money, MTN, Moov, Free Money
- Currency: XOF (West African CFA Franc)
- Payment flow: Mobile money number → OTP confirmation → Payment complete

---

## Story 6.3c: Orange Money Integration Setup

As a developer,
I want to integrate Orange Money payment processing into the platform,
So that users across francophone Africa can subscribe using Orange Money.

### Acceptance Criteria

1. Orange Money API SDK/library installed or custom HTTP client configured
2. Orange Money API credentials configured in .env (ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, ORANGE_MONEY_WEBHOOK_SECRET)
3. Orange Money merchant account created and verified
4. OAuth2 token generation implemented for Orange Money API authentication
5. Payment products configured for Pro-XOF and Premium-XOF plans
6. Product IDs stored in SubscriptionPlan records (orangeProductId)
7. Orange Money checkout API endpoint created (POST /api/billing/checkout/orange)
8. Checkout endpoint initiates Orange Money payment with phone number
9. User receives SMS with OTP for payment confirmation
10. Success/cancel URLs configured for post-payment flow
11. Orange Money payment status checked via polling or webhook
12. Subscription record created with paymentProvider='orange_money'
13. Error handling for Orange Money API failures with localized messages (FR)
14. Orange Money branding displayed on payment selection page

**Technical Notes**:
- Orange Money API documentation: https://developer.orange.com/apis/orange-money/
- Coverage: 17+ African countries
- Currency: XOF (primary), local currencies for other markets
- Payment flow: Phone number → SMS OTP → Payment confirmation

---

## Story 6.3d: Wave Webhook Handler

As a developer,
I want to handle Wave webhook events to sync payment and subscription status,
So that Wave subscription changes are reflected in the database in real-time.

### Acceptance Criteria

1. Wave webhook endpoint created (POST /api/webhooks/wave)
2. Webhook signature verification implemented for security
3. Webhook handles event: payment.completed (successful payment)
4. payment.completed creates Subscription record with status 'active'
5. Webhook handles event: payment.failed (payment failure)
6. payment.failed updates Subscription status to 'past_due'
7. Webhook handles event: subscription.renewed (monthly renewal)
8. subscription.renewed updates Subscription period dates
9. Webhook handles event: subscription.cancelled (user cancellation)
10. subscription.cancelled updates Subscription status to 'cancelled'
11. Payment record created in Payment model for each transaction
12. Webhook logs all events for debugging
13. Webhook returns 200 OK for processed events, 400 for errors
14. Idempotency handling prevents duplicate processing

---

## Story 6.3e: Orange Money Webhook Handler

As a developer,
I want to handle Orange Money webhook events to sync payment status,
So that Orange Money subscription changes are reflected in the database in real-time.

### Acceptance Criteria

1. Orange Money webhook endpoint created (POST /api/webhooks/orange)
2. Webhook signature/token verification implemented for security
3. Webhook handles event: payment.success (successful payment)
4. payment.success creates Subscription record with status 'active'
5. Webhook handles event: payment.failure (payment failure)
6. payment.failure updates Subscription status to 'past_due'
7. Webhook handles event: subscription.renewal (monthly renewal)
8. subscription.renewal updates Subscription period dates
9. Payment record created in Payment model for each transaction
10. Webhook logs all events for debugging
11. Webhook returns 200 OK for processed events, 400 for errors
12. Idempotency handling prevents duplicate processing
13. Fallback to polling if webhooks unavailable

**Technical Notes**:
- Orange Money may require polling for payment status if webhooks not fully supported
- Implement exponential backoff for polling (1s, 2s, 5s, 10s intervals)
- Timeout after 5 minutes with payment status 'pending'

---

## Story 6.4: Subscription Limits Enforcement - Surveys

As a user,
I want the system to enforce survey creation limits based on my subscription plan,
So that I cannot exceed my plan's allowed survey count.

### Acceptance Criteria

1. Middleware function created: checkSurveyLimit(userId)
2. Function queries UsageTracking for current survey count
3. Function compares count against PlanLimit for user's current plan
4. Survey creation API (POST /api/surveys) includes limit check
5. Limit check executes before creating survey
6. If limit reached, API returns 403 error with message (i18n: `Subscription.survey_limit_reached`)
7. Error message includes upgrade CTA: "Upgrade to Pro/Premium to create more surveys"
8. Dashboard displays usage indicator: "X of Y surveys used" (i18n: `Subscription.surveys_used`)
9. Usage indicator updates in real-time after survey creation/deletion
10. Premium users see "Unlimited surveys" message
11. Survey deletion decrements usage count in UsageTracking
12. Usage count synced across all user sessions
13. All limit messages and CTAs fully translated (en.json, fr.json)

---

## Story 6.5: Subscription Limits Enforcement - Organizations

As a user,
I want the system to enforce organization creation limits based on my subscription plan,
So that Free users cannot create organizations and Pro users are limited to 1 organization.

### Acceptance Criteria

1. "Create Organization" button hidden for Free plan users
2. Free users attempting to access /organizations/new redirected with error (i18n: `Subscription.organization_upgrade_required`)
3. Middleware function created: checkOrganizationLimit(userId)
4. Function queries UsageTracking for current organization count
5. Organization creation API (POST /api/organizations) includes limit check
6. Pro users blocked from creating 2nd organization with error message (i18n: `Subscription.organization_limit_reached`)
7. Error message includes upgrade CTA: "Upgrade to Premium for unlimited organizations"
8. Pro users see indicator: "1 of 1 organization used"
9. Premium users see "Unlimited organizations"
10. Organization deletion decrements usage count
11. Usage tracking updated in real-time
12. All error messages and CTAs fully translated

---

## Story 6.6: Subscription Limits Enforcement - Organization Members

As an organization owner,
I want the system to enforce member invitation limits based on my subscription plan,
So that Pro organizations cannot exceed 5 members.

### Acceptance Criteria

1. Middleware function created: checkMemberLimit(organizationId, userId)
2. Function queries organization's member count from OrganizationMember
3. Function checks organization owner's subscription plan limits
4. Member invitation API (POST /api/organizations/[id]/invitations) includes limit check
5. Pro organizations blocked from inviting 6th member with error (i18n: `Subscription.member_limit_reached`)
6. Error includes upgrade CTA: "Upgrade to Premium for unlimited members"
7. Organization settings display member usage: "X of Y members" (Pro) or "Unlimited members" (Premium)
8. Accepting invitation checks limit before creating OrganizationMember record
9. Member removal decrements count and allows new invitations
10. Pending invitations count toward limit (to prevent circumvention)
11. Premium organizations see "Unlimited members"
12. All limit messages fully translated

---

## Story 6.7: Pricing Page UI

As a user,
I want to view subscription plan options and features on a pricing page,
So that I can choose the plan that fits my needs.

### Acceptance Criteria

1. Pricing page created at /pricing with public access
2. Page displays all four tiers: Free, Pro, Premium, Custom
3. Each plan card shows: name, price, billing interval, feature list
4. Free plan features: "5 surveys", "Basic analytics", "CSV export", "Email support"
5. Pro plan features: "1 organization", "5 team members", "10 surveys per user (50 max)", "Advanced analytics", "Priority support"
6. Premium plan features: "Unlimited organizations", "Unlimited members", "Unlimited surveys", "Custom branding", "API access", "Dedicated support"
7. Custom plan features: "Everything in Premium", "Custom contracts", "SSO/SAML", "Dedicated account manager", "SLA guarantees"
8. Each plan has CTA button: Free ("Get Started"), Pro/Premium ("Subscribe Now"), Custom ("Contact Us")
9. Current plan highlighted for authenticated users (i18n: `Subscription.current_plan`)
10. Annual billing option toggle (shows discounted pricing)
11. FAQ section answering common questions
12. Mobile-responsive card layout
13. All plan names, features, CTAs fully translated

---

## Story 6.8: Subscription Upgrade Flow

As a user on Free or Pro plan,
I want to upgrade to a higher-tier plan,
So that I can access additional features and remove limits.

### Acceptance Criteria

1. "Upgrade" button displayed in navigation bar for Free/Pro users (i18n: `Subscription.upgrade`)
2. Upgrade button opens pricing modal or navigates to /pricing
3. Clicking plan CTA initiates Stripe checkout session
4. API endpoint (POST /api/billing/checkout) creates Stripe checkout session
5. Checkout session includes plan selection (Pro or Premium)
6. User redirected to Stripe hosted checkout page
7. Checkout page accepts payment method (card, Google Pay, etc.)
8. Successful payment redirects to /billing/success
9. Success page confirms subscription activation (i18n: `Subscription.upgrade_success`)
10. Webhook updates Subscription record and user's currentPlanId
11. User immediately gains access to new plan features
12. Usage limits updated based on new plan
13. Failed payment redirects to /billing/cancelled with error message (i18n: `Subscription.upgrade_failed`)
14. All messages and CTAs fully translated

---

## Story 6.9: Subscription Downgrade Flow

As a user on Pro or Premium plan,
I want to downgrade to a lower-tier plan,
So that I can reduce costs if I no longer need advanced features.

### Acceptance Criteria

1. "Manage Billing" button in account settings opens Stripe Customer Portal
2. Customer Portal accessed via API endpoint (POST /api/billing/portal)
3. Portal allows changing subscription plan (Pro → Free, Premium → Pro/Free)
4. Downgrade scheduled for end of current billing period
5. Subscription.cancelAtPeriodEnd set to true for downgrades
6. User continues to have access to current plan until period end
7. Dashboard displays notice: "Your plan will change to [Plan] on [Date]" (i18n: `Subscription.downgrade_scheduled`)
8. Webhook handles subscription change at period end
9. Usage limits enforced immediately after downgrade takes effect
10. If usage exceeds new plan limits, user warned before downgrade (i18n: `Subscription.downgrade_usage_warning`)
11. Warning shows: "You have X surveys but the Free plan allows 5. Delete Y surveys before downgrading."
12. Downgrade blocked until usage complies with new limits
13. All notices and warnings fully translated

---

## Story 6.10: Billing Dashboard & Payment History

As a subscribed user,
I want to view my subscription details and payment history,
So that I can track my billing and manage my account.

### Acceptance Criteria

1. Billing page created at /billing with authenticated access
2. Page displays current plan: name, price, billing interval, next billing date
3. Page shows payment method (last 4 digits of card)
4. "Update Payment Method" button opens Stripe Customer Portal
5. Payment history table displays: date, amount, status (paid/failed), invoice link
6. Invoice link downloads PDF from Stripe
7. Billing history fetched from Stripe API (GET /api/billing/history)
8. Page includes "Cancel Subscription" button
9. Cancellation shows confirmation dialog with consequences (i18n: `Subscription.cancel_confirm`)
10. Cancellation schedules subscription cancellation at period end
11. Cancelled subscriptions show reactivation option
12. Page displays usage metrics for current plan (surveys used, orgs, members)
13. Mobile-responsive layout
14. All labels, buttons, and messages fully translated

---

## Story 6.11: Subscription Status Indicators

As a user,
I want to see my subscription status throughout the application,
So that I'm always aware of my plan limits and can upgrade when needed.

### Acceptance Criteria

1. Navigation bar displays current plan badge: "Free", "Pro", or "Premium" (i18n: `Subscription.[plan]_plan`)
2. Dashboard displays usage widgets: surveys, organizations, members (with limits)
3. Usage widgets show progress bars or fractions (e.g., "3 of 5 surveys")
4. Widgets turn yellow at 80% usage, red at 100%
5. Limit reached shows alert banner with upgrade CTA (i18n: `Subscription.limit_reached_banner`)
6. Survey creation page displays remaining survey count
7. Organization creation flow shows organization allowance
8. Member invitation modal shows remaining member slots
9. "past_due" subscription status shows urgent payment warning (i18n: `Subscription.payment_failed_warning`)
10. Warning blocks new survey/org creation until payment resolved
11. All plan badges and usage indicators fully translated

---

## Story 6.12: Contact Us for Custom Plan

As a potential enterprise customer,
I want to contact the sales team for a custom plan,
So that I can discuss enterprise requirements and pricing.

### Acceptance Criteria

1. Custom plan card on pricing page includes "Contact Us" CTA
2. CTA navigates to /contact or opens contact modal
3. Contact form includes fields: name, email, company, message (all i18n labeled)
4. Form includes dropdown: "Interested in Custom/Enterprise plan" pre-selected
5. Form submission sends email to sales team via API (POST /api/contact)
6. Email includes all form details and timestamp
7. Success message shown after submission (i18n: `Contact.message_sent`)
8. Email sent to user confirming inquiry received
9. Error handling for failed email delivery
10. Form validation prevents empty submissions
11. CAPTCHA or rate limiting prevents spam
12. All form labels and messages fully translated

---

## Story 6.13: Grandfathering & Plan Migration

As a developer,
I want to handle existing users during subscription rollout,
So that current users are migrated to appropriate plans without disruption.

### Acceptance Criteria

1. Migration script created to assign plans to existing users
2. All existing users assigned to Free plan by default
3. Users with organizations assigned to Pro plan (grace period)
4. Migration logs all user plan assignments
5. Email sent to all users announcing new subscription tiers (both EN/FR)
6. Email includes 30-day grace period notice for Pro features
7. Grace period enforced via Subscription.graceEndsAt field
8. After grace period, limits enforced normally
9. Dashboard displays grace period notice if applicable (i18n: `Subscription.grace_period_notice`)
10. Migration reversible via rollback script
11. All migration emails and notices fully translated

---

## Story 6.14: Trial Period for Pro Plan

As a new user,
I want to try the Pro plan free for 14 days,
So that I can evaluate premium features before committing.

### Acceptance Criteria

1. New users offered 14-day Pro trial during onboarding
2. Trial modal displays Pro features and benefits
3. "Start Free Trial" button creates trial subscription
4. Trial subscription has status: "trialing", no payment required
5. Trial period stored in Subscription.currentPeriodEnd
6. Trial users have access to all Pro features
7. Dashboard displays trial status: "X days remaining in trial" (i18n: `Subscription.trial_remaining`)
8. Trial expiration warning shown 3 days before end (i18n: `Subscription.trial_expiring_soon`)
9. At trial end, user prompted to enter payment method
10. User can convert to paid subscription during trial
11. Trial automatically downgrades to Free if no payment added
12. One trial per user enforced via database constraint
13. All trial notices and prompts fully translated

---

## Story 6.15: Payment Provider Selection UI

As a user upgrading to a paid plan,
I want to choose my preferred payment method (Stripe, Wave, or Orange Money),
So that I can pay using my most convenient payment option.

### Acceptance Criteria

1. Pricing page displays payment method selector with 3 options
2. **Option 1**: Credit/Debit Card (Stripe) - with Visa, Mastercard, Amex logos
3. **Option 2**: Wave (Mobile Money) - with Wave logo and "Senegal, CI, Mali, Burkina" label
4. **Option 3**: Orange Money - with Orange Money logo and "17+ African countries" label
5. Payment method selection stored in User.preferredPaymentProvider
6. Currency automatically selected based on payment method:
   - Stripe → USD/EUR (user choice)
   - Wave → XOF
   - Orange Money → XOF
7. Pricing displayed in selected currency (e.g., "$29/mo" or "15,000 FCFA/mois")
8. Location auto-detection suggests payment method:
   - African IPs → Default to Wave/Orange Money
   - Other IPs → Default to Stripe
9. "Change payment method" link available on pricing page
10. Payment method icons visible on subscription upgrade button
11. Checkout flow redirects to appropriate provider (Stripe Checkout, Wave, Orange)
12. All payment method labels and descriptions fully translated (EN/FR)

**UX Notes**:
- Display payment methods as large, clickable cards with logos
- Show "Most popular in your region" badge for suggested method
- Include "What's this?" tooltip explaining mobile money for non-African users

---

## Story 6.16: Multi-Currency Pricing Display

As a user viewing pricing,
I want to see prices in my local currency,
So that I understand the cost in familiar terms.

### Acceptance Criteria

1. Currency selector added to pricing page (USD, EUR, XOF)
2. Currency preference stored in cookie/localStorage
3. Location-based currency auto-detection:
   - West Africa (SN, CI, BF, ML, TG, BJ, NE) → XOF
   - Europe → EUR
   - Rest of world → USD
4. Pricing displayed with proper formatting:
   - USD: "$29.00/month"
   - EUR: "€26.00/mois"
   - XOF: "15 000 FCFA/mois"
5. Number formatting follows locale conventions:
   - USD/EUR: "29.00" (decimal point)
   - XOF: "15 000" (space separator, no decimals)
6. Currency conversion rates displayed as footnote:
   - "1 USD = ~620 XOF" (approximate, updated quarterly)
7. All plans show consistent currency throughout pricing page
8. Plan cards show currency symbol and code
9. Billing dashboard displays all historical payments in original currency
10. Invoice PDFs include both original currency and USD equivalent
11. Currency switcher preserves selection across page navigations
12. All currency labels and formatting fully localized (EN/FR)

**Technical Notes**:
- XOF exchange rate: ~620 FCFA = 1 USD (fixed to EUR)
- Use Intl.NumberFormat for locale-specific formatting
- Store exchange rates in database for historical accuracy
- Update exchange rates quarterly or via external API

---

## Checklist Summary

**Epic 6 delivers:**
- ✅ Complete subscription tier system (Free, Pro, Premium, Custom)
- ✅ **Multi-payment provider integration** (Stripe, Wave, Orange Money)
- ✅ **Multi-currency support** (USD, EUR, XOF/CFA Franc)
- ✅ Stripe payment integration with checkout and webhooks
- ✅ Wave mobile money integration for West Africa
- ✅ Orange Money integration for francophone Africa
- ✅ Payment provider selection UI with auto-detection
- ✅ Usage limit enforcement for surveys, organizations, and members
- ✅ Self-service upgrade/downgrade flows
- ✅ Billing dashboard and payment history
- ✅ Subscription status indicators throughout app
- ✅ Enterprise contact form for Custom plan
- ✅ User migration and grandfathering strategy
- ✅ 14-day Pro trial for new users
- ✅ Full internationalization (EN/FR) for all subscription features
- ✅ Regional pricing optimization for African markets

**Total Stories**: 16 (was 14, added 2 for multi-payment provider support)

**Payment Providers**:
1. **Stripe** → Global credit/debit cards (USD, EUR)
2. **Wave** → Mobile money for Senegal, CI, Mali, Burkina (XOF)
3. **Orange Money** → Mobile money across 17+ African countries (XOF)

**Next Epic:** Epic 7 - Marketing Website & Landing Pages
