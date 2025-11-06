# Story 6.3b: Wave Integration Setup

**Status**: 📝 Draft
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.3b
**Date Created**: 2025-11-05
**Estimated Effort**: 6-8 hours

---

## 📋 Story Overview

**User Story**:
As a developer, I want to integrate Wave payment processing into the platform, so that users in West Africa can subscribe using mobile money (Wave).

**Business Value**:
Wave integration enables monetization in West African markets (Senegal, Côte d'Ivoire, Burkina Faso, Mali) where mobile money is the dominant payment method. This significantly expands the addressable market and provides local payment options that increase conversion rates in the region.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)
- ✅ Story 6.2: Stripe Integration (for reference patterns)

---

## ✅ Acceptance Criteria

**Wave SDK Setup:**
1. Wave API SDK/library installed or custom HTTP client configured
2. Wave API credentials configured in .env (WAVE_API_KEY, WAVE_MERCHANT_ID, WAVE_WEBHOOK_SECRET)
3. Wave business account created and verified for Senegal/West Africa

**Product Configuration:**
4. Wave payment products created for Pro-XOF and Premium-XOF plans
5. Product IDs stored in SubscriptionPlan records (waveProductId)

**Checkout Flow:**
6. Wave checkout API endpoint created (POST /api/billing/checkout/wave)
7. Checkout endpoint initiates Wave payment session with mobile money
8. User redirected to Wave payment page (mobile money number input)
9. Success/cancel URLs configured for post-payment flow

**Integration:**
10. Wave payment confirmation handled via webhook
11. Subscription record created with paymentProvider='wave'
12. Error handling for Wave API failures with localized messages (FR)
13. Wave logo and branding displayed on payment selection page

---

## 🏗️ Technical Implementation

### Wave API Configuration

```typescript
// lib/services/wave-client.ts
import axios, { AxiosInstance } from 'axios';

const WAVE_API_BASE_URL = process.env.WAVE_API_BASE_URL || 'https://api.wave.com/v1';

export class WaveClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: WAVE_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPaymentSession(params: {
    amount: number;
    currency: string;
    planId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const response = await this.client.post('/checkout/sessions', {
      amount: params.amount,
      currency: params.currency,
      merchant_id: process.env.WAVE_MERCHANT_ID,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        planId: params.planId,
        userId: params.userId,
      },
    });

    return response.data;
  }

  async getPaymentStatus(sessionId: string) {
    const response = await this.client.get(`/checkout/sessions/${sessionId}`);
    return response.data;
  }
}

export const waveClient = new WaveClient();
```

### Checkout Endpoint

```typescript
// app/api/billing/checkout/wave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { waveClient } from '@/lib/services/wave-client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, billingPeriod = 'monthly' } = await req.json();

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.waveProductId) {
      return NextResponse.json(
        { error: 'Invalid plan or Wave not supported for this plan' },
        { status: 400 }
      );
    }

    // Create Wave payment session
    const paymentSession = await waveClient.createPaymentSession({
      amount: plan.price,
      currency: plan.currency,
      planId: plan.id,
      userId: session.user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancelled`,
    });

    return NextResponse.json({
      url: paymentSession.checkout_url,
      sessionId: paymentSession.id,
    });
  } catch (error: any) {
    console.error('Wave checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create Wave payment session', details: error.message },
      { status: 500 }
    );
  }
}
```

### Environment Variables

```bash
# .env additions
WAVE_API_KEY=your_wave_api_key
WAVE_MERCHANT_ID=your_wave_merchant_id
WAVE_WEBHOOK_SECRET=your_wave_webhook_secret
WAVE_API_BASE_URL=https://api.wave.com/v1
```

### Database Updates

```typescript
// Update SubscriptionPlan records to include waveProductId
// Run via Prisma Studio or migration script

UPDATE SubscriptionPlan
SET waveProductId = 'wave_prod_pro_xof'
WHERE name = 'Pro' AND currency = 'XOF';

UPDATE SubscriptionPlan
SET waveProductId = 'wave_prod_premium_xof'
WHERE name = 'Premium' AND currency = 'XOF';
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wave API credentials configured in .env
- [ ] Wave checkout endpoint responds correctly
- [ ] Payment session created with correct amount/currency
- [ ] User redirected to Wave payment page
- [ ] Mobile money number input displayed
- [ ] Success URL handles completed payment
- [ ] Cancel URL handles cancelled payment
- [ ] Error messages display in French for XOF plans
- [ ] Wave logo displayed on payment selection page
- [ ] waveProductId stored in database for XOF plans

### Test Scenarios

1. **Happy Path**: User selects Pro-XOF plan → redirected to Wave → enters phone → completes payment → redirected to success page
2. **Cancellation**: User cancels payment → redirected to cancel page with appropriate message
3. **Error Handling**: API failure → user sees localized error message in French
4. **Invalid Plan**: User tries to pay for USD plan with Wave → appropriate error shown

---

## 📝 Implementation Tasks

- [ ] Install Wave SDK or configure HTTP client
- [ ] Add Wave API credentials to .env and .env.example
- [ ] Create WaveClient service class
- [ ] Implement createPaymentSession method
- [ ] Implement getPaymentStatus method
- [ ] Create Wave checkout API endpoint
- [ ] Add Wave product IDs to database via migration
- [ ] Implement error handling with French localization
- [ ] Add Wave logo to payment method selector
- [ ] Test full checkout flow
- [ ] Document Wave integration in README

---

## 🎯 Definition of Done

- [ ] Wave API client configured and working
- [ ] Checkout endpoint creates payment sessions successfully
- [ ] Users redirected to Wave payment page
- [ ] Success/cancel flows work correctly
- [ ] Error messages localized in French
- [ ] Wave branding displayed appropriately
- [ ] All environment variables documented
- [ ] Integration tested with Wave sandbox/test mode
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.1 (Database Schema), Story 6.2 (Stripe Integration - patterns)
- **Blocks**: Story 6.3d (Wave Webhook Handler)
- **Related**: Story 6.15 (Payment Provider Selection), Story 6.16 (Multi-Currency Pricing)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📚 Technical Notes

**Wave API Documentation**: https://developer.wave.com

**Supported Mobile Money Providers**:
- Orange Money
- MTN Mobile Money
- Moov Money
- Free Money

**Currency**: XOF (West African CFA Franc)
- Fixed exchange rate to EUR: 1 EUR = 655.957 XOF
- Approximate USD rate: 1 USD ≈ 620 XOF

**Payment Flow**:
1. User initiates payment on platform
2. Redirect to Wave payment page
3. User enters mobile money number
4. User receives OTP via SMS
5. User confirms payment with OTP
6. Payment complete → webhook notification
7. User redirected to success URL

**Testing**:
- Wave provides sandbox environment for testing
- Test credentials available in Wave developer dashboard
- Use test phone numbers provided by Wave for sandbox testing

---

## 📋 Dev Agent Record

### Agent Model Used
- TBD (to be filled by dev agent)

### Completion Notes
- TBD (to be filled by dev agent)

### File List
- TBD (to be filled by dev agent)
