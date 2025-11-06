# Story 6.3c: Orange Money Integration Setup

**Status**: 📝 Draft
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.3c
**Date Created**: 2025-11-05
**Estimated Effort**: 6-8 hours

---

## 📋 Story Overview

**User Story**:
As a developer, I want to integrate Orange Money payment processing into the platform, so that users across francophone Africa can subscribe using Orange Money.

**Business Value**:
Orange Money integration extends our reach across 17+ African countries where Orange Money is widely used. This provides an alternative mobile money option to Wave, increasing payment flexibility and market coverage across francophone Africa.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)
- ✅ Story 6.2: Stripe Integration (for reference patterns)
- ✅ Story 6.3b: Wave Integration (for mobile money patterns)

---

## ✅ Acceptance Criteria

**Orange Money SDK Setup:**
1. Orange Money API SDK/library installed or custom HTTP client configured
2. Orange Money API credentials configured in .env (ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, ORANGE_MONEY_WEBHOOK_SECRET)
3. Orange Money merchant account created and verified

**Authentication:**
4. OAuth2 token generation implemented for Orange Money API authentication

**Product Configuration:**
5. Payment products configured for Pro-XOF and Premium-XOF plans
6. Product IDs stored in SubscriptionPlan records (orangeProductId)

**Checkout Flow:**
7. Orange Money checkout API endpoint created (POST /api/billing/checkout/orange)
8. Checkout endpoint initiates Orange Money payment with phone number
9. User receives SMS with OTP for payment confirmation
10. Success/cancel URLs configured for post-payment flow

**Payment Status:**
11. Orange Money payment status checked via polling or webhook
12. Subscription record created with paymentProvider='orange_money'

**Error Handling & Branding:**
13. Error handling for Orange Money API failures with localized messages (FR)
14. Orange Money branding displayed on payment selection page

---

## 🏗️ Technical Implementation

### Orange Money API Configuration

```typescript
// lib/services/orange-money-client.ts
import axios, { AxiosInstance } from 'axios';

const ORANGE_MONEY_API_BASE_URL = process.env.ORANGE_MONEY_API_BASE_URL || 'https://api.orange.com/orange-money-webpay/v1';
const ORANGE_MONEY_AUTH_URL = process.env.ORANGE_MONEY_AUTH_URL || 'https://api.orange.com/oauth/v3/token';

export class OrangeMoneyClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: ORANGE_MONEY_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Generate new token using OAuth2 client credentials flow
    const response = await axios.post(
      ORANGE_MONEY_AUTH_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        auth: {
          username: process.env.ORANGE_MONEY_CLIENT_ID!,
          password: process.env.ORANGE_MONEY_CLIENT_SECRET!,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.accessToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  async createPayment(params: {
    amount: number;
    currency: string;
    phoneNumber: string;
    planId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const token = await this.getAccessToken();

    const response = await this.client.post(
      '/payments',
      {
        amount: params.amount,
        currency: params.currency,
        subscriber_msisdn: params.phoneNumber,
        merchant_reference: `subscription_${params.userId}_${Date.now()}`,
        return_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          planId: params.planId,
          userId: params.userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

  async getPaymentStatus(paymentId: string) {
    const token = await this.getAccessToken();

    const response = await this.client.get(`/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async pollPaymentStatus(
    paymentId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getPaymentStatus(paymentId);

      if (status.status === 'SUCCESS' || status.status === 'FAILED') {
        return status;
      }

      // Wait before next attempt with exponential backoff
      const delay = Math.min(intervalMs * Math.pow(1.5, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Timeout after max attempts
    return { status: 'TIMEOUT', message: 'Payment status check timed out' };
  }
}

export const orangeMoneyClient = new OrangeMoneyClient();
```

### Checkout Endpoint

```typescript
// app/api/billing/checkout/orange/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { orangeMoneyClient } from '@/lib/services/orange-money-client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required for Orange Money payment' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.orangeProductId) {
      return NextResponse.json(
        { error: 'Invalid plan or Orange Money not supported for this plan' },
        { status: 400 }
      );
    }

    // Create Orange Money payment
    const payment = await orangeMoneyClient.createPayment({
      amount: plan.price,
      currency: plan.currency,
      phoneNumber,
      planId: plan.id,
      userId: session.user.id,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?payment_id={PAYMENT_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancelled`,
    });

    return NextResponse.json({
      paymentId: payment.payment_id,
      status: payment.status,
      message: 'SMS sent to your phone. Please confirm payment.',
    });
  } catch (error: any) {
    console.error('Orange Money checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create Orange Money payment', details: error.message },
      { status: 500 }
    );
  }
}
```

### Payment Status Polling Endpoint

```typescript
// app/api/billing/checkout/orange/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { orangeMoneyClient } from '@/lib/services/orange-money-client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentId = req.nextUrl.searchParams.get('paymentId');
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const status = await orangeMoneyClient.getPaymentStatus(paymentId);

    return NextResponse.json({
      status: status.status,
      paymentId: status.payment_id,
      amount: status.amount,
      currency: status.currency,
    });
  } catch (error: any) {
    console.error('Orange Money status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status', details: error.message },
      { status: 500 }
    );
  }
}
```

### Environment Variables

```bash
# .env additions
ORANGE_MONEY_CLIENT_ID=your_orange_money_client_id
ORANGE_MONEY_CLIENT_SECRET=your_orange_money_client_secret
ORANGE_MONEY_WEBHOOK_SECRET=your_orange_money_webhook_secret
ORANGE_MONEY_API_BASE_URL=https://api.orange.com/orange-money-webpay/v1
ORANGE_MONEY_AUTH_URL=https://api.orange.com/oauth/v3/token
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Orange Money API credentials configured in .env
- [ ] OAuth2 token generation works correctly
- [ ] Payment creation endpoint responds correctly
- [ ] SMS sent to test phone number
- [ ] OTP confirmation flow works
- [ ] Payment status polling works correctly
- [ ] Success URL handles completed payment
- [ ] Cancel URL handles cancelled payment
- [ ] Timeout handling works (5-minute limit)
- [ ] Error messages display in French
- [ ] Orange Money logo displayed on payment selection page
- [ ] orangeProductId stored in database for XOF plans

### Test Scenarios

1. **Happy Path**: User enters phone → SMS received → OTP confirmed → payment success → subscription created
2. **Cancellation**: User cancels SMS OTP → payment cancelled → redirected to cancel page
3. **Timeout**: User doesn't confirm within 5 minutes → timeout → appropriate message shown
4. **Error Handling**: API failure → user sees localized error message in French
5. **Invalid Phone**: Invalid phone number → validation error shown

---

## 📝 Implementation Tasks

- [ ] Install Orange Money SDK or configure HTTP client
- [ ] Add Orange Money API credentials to .env and .env.example
- [ ] Create OrangeMoneyClient service class
- [ ] Implement OAuth2 token generation
- [ ] Implement createPayment method
- [ ] Implement getPaymentStatus method
- [ ] Implement pollPaymentStatus with exponential backoff
- [ ] Create Orange Money checkout API endpoint
- [ ] Create payment status polling endpoint
- [ ] Add Orange Money product IDs to database via migration
- [ ] Implement error handling with French localization
- [ ] Add Orange Money logo to payment method selector
- [ ] Test full payment flow with test credentials
- [ ] Document Orange Money integration in README

---

## 🎯 Definition of Done

- [ ] Orange Money API client configured with OAuth2
- [ ] Checkout endpoint creates payments successfully
- [ ] SMS OTP flow works correctly
- [ ] Payment status polling works with exponential backoff
- [ ] Success/cancel flows work correctly
- [ ] Timeout handling implemented (5-minute limit)
- [ ] Error messages localized in French
- [ ] Orange Money branding displayed appropriately
- [ ] All environment variables documented
- [ ] Integration tested with Orange Money sandbox
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.1 (Database Schema), Story 6.2 (Stripe Integration), Story 6.3b (Wave Integration)
- **Blocks**: Story 6.3e (Orange Money Webhook Handler)
- **Related**: Story 6.15 (Payment Provider Selection), Story 6.16 (Multi-Currency Pricing)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📚 Technical Notes

**Orange Money API Documentation**: https://developer.orange.com/apis/orange-money/

**Coverage**: 17+ African countries including:
- Senegal, Côte d'Ivoire, Mali, Burkina Faso
- Cameroon, Niger, Guinea, Madagascar
- DRC, Liberia, Sierra Leone, and more

**Currency**: Primarily XOF (West African CFA Franc), also supports local currencies in other markets

**Authentication**: OAuth2 client credentials flow
- Token expires after 1 hour
- Implement token caching and refresh

**Payment Flow**:
1. User initiates payment with phone number
2. API creates payment request
3. User receives SMS with OTP
4. User confirms payment with OTP
5. Poll payment status (or receive webhook)
6. Payment confirmed → subscription created
7. User redirected to success URL

**Polling Strategy**:
- Initial polling: every 1-2 seconds
- Exponential backoff: 1s, 2s, 5s, 10s
- Maximum timeout: 5 minutes
- After timeout, payment status set to 'pending'

**Testing**:
- Orange Money provides sandbox environment
- Test credentials available in developer portal
- Use test phone numbers for sandbox testing
- Test with different scenarios (success, failure, timeout)

---

## 📋 Dev Agent Record

### Agent Model Used
- TBD (to be filled by dev agent)

### Completion Notes
- TBD (to be filled by dev agent)

### File List
- TBD (to be filled by dev agent)
