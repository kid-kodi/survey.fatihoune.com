# Story 6.3e: Orange Money Webhook Handler

**Status**: 📝 Draft
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.3e
**Date Created**: 2025-11-05
**Estimated Effort**: 4-6 hours

---

## 📋 Story Overview

**User Story**:
As a developer, I want to handle Orange Money webhook events to sync payment status, so that Orange Money subscription changes are reflected in the database in real-time.

**Business Value**:
Webhook handling (combined with polling fallback) ensures that subscription status is updated when Orange Money processes payments, providing accurate subscription state management and good user experience.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)
- ✅ Story 6.3c: Orange Money Integration Setup (REQUIRED)
- ✅ Story 6.3d: Wave Webhook Handler (for patterns)

---

## ✅ Acceptance Criteria

**Webhook Endpoint:**
1. Orange Money webhook endpoint created (POST /api/webhooks/orange)
2. Webhook signature/token verification implemented for security

**Event Handling - Payment Success:**
3. Webhook handles event: payment.success (successful payment)
4. payment.success creates Subscription record with status 'active'

**Event Handling - Payment Failure:**
5. Webhook handles event: payment.failure (payment failure)
6. payment.failure updates Subscription status to 'past_due'

**Event Handling - Subscription Renewal:**
7. Webhook handles event: subscription.renewal (monthly renewal)
8. subscription.renewal updates Subscription period dates

**Payment Records:**
9. Payment record created in Payment model for each transaction

**Reliability:**
10. Webhook logs all events for debugging
11. Webhook returns 200 OK for processed events, 400 for errors
12. Idempotency handling prevents duplicate processing
13. Fallback to polling if webhooks unavailable

---

## 🏗️ Technical Implementation

### Webhook Endpoint

```typescript
// app/api/webhooks/orange/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Verify Orange Money webhook token
function verifyWebhookToken(token: string): boolean {
  return token === process.env.ORANGE_MONEY_WEBHOOK_SECRET;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const authToken = headersList.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      console.error('Missing Orange Money authorization header');
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    // Verify webhook token
    if (!verifyWebhookToken(authToken)) {
      console.error('Invalid Orange Money webhook token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Log event for debugging
    console.log('[Orange Money Webhook] Received event:', event.event_type, event.payment_id);

    // Check idempotency - prevent duplicate processing
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { providerEventId: event.payment_id },
    });

    if (existingEvent) {
      console.log('[Orange Money Webhook] Event already processed:', event.payment_id);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'orange_money',
        providerEventId: event.payment_id,
        eventType: event.event_type,
        payload: event,
        processedAt: new Date(),
      },
    });

    // Handle different event types
    switch (event.event_type) {
      case 'payment.success':
        await handlePaymentSuccess(event);
        break;

      case 'payment.failure':
        await handlePaymentFailure(event);
        break;

      case 'subscription.renewal':
        await handleSubscriptionRenewal(event);
        break;

      default:
        console.log('[Orange Money Webhook] Unhandled event type:', event.event_type);
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error: any) {
    console.error('[Orange Money Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 400 }
    );
  }
}

async function handlePaymentSuccess(event: any) {
  const { metadata, amount, currency, payment_id } = event;
  const { userId, planId } = metadata;

  console.log('[Orange Money Webhook] Processing payment.success for user:', userId);

  // Get plan details
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    console.error('[Orange Money Webhook] Plan not found:', planId);
    return;
  }

  // Create or update subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId, status: { in: ['active', 'trialing'] } },
  });

  if (existingSubscription) {
    // Update existing subscription
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        planId,
        status: 'active',
        paymentProvider: 'orange_money',
        providerSubscriptionId: payment_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  } else {
    // Create new subscription
    await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
        paymentProvider: 'orange_money',
        providerSubscriptionId: payment_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Update user's current plan
  await prisma.user.update({
    where: { id: userId },
    data: { currentPlanId: planId },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId: existingSubscription?.id,
      amount,
      currency,
      provider: 'orange_money',
      providerPaymentId: payment_id,
      status: 'completed',
      paidAt: new Date(),
    },
  });

  console.log('[Orange Money Webhook] Payment success and subscription activated for user:', userId);
}

async function handlePaymentFailure(event: any) {
  const { metadata, payment_id } = event;
  const { userId } = metadata;

  console.log('[Orange Money Webhook] Processing payment.failure for user:', userId);

  // Find active subscription
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  });

  if (subscription) {
    // Update subscription status to past_due
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'past_due' },
    });

    console.log('[Orange Money Webhook] Subscription marked as past_due for user:', userId);
  }

  // Create failed payment record
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId: subscription?.id,
      amount: event.amount,
      currency: event.currency,
      provider: 'orange_money',
      providerPaymentId: payment_id,
      status: 'failed',
    },
  });
}

async function handleSubscriptionRenewal(event: any) {
  const { subscription_id, renewal_date } = event;

  console.log('[Orange Money Webhook] Processing subscription.renewal:', subscription_id);

  // Find subscription by provider ID
  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subscription_id },
  });

  if (subscription) {
    // Update subscription period dates
    const renewalDate = new Date(renewal_date);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: renewalDate,
        currentPeriodEnd: new Date(renewalDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    });

    console.log('[Orange Money Webhook] Subscription renewed:', subscription_id);
  }
}
```

### Polling Fallback (if webhooks not available)

```typescript
// lib/services/orange-money-polling.ts
import { prisma } from '@/lib/prisma';
import { orangeMoneyClient } from './orange-money-client';

export async function startPaymentStatusPolling(paymentId: string, userId: string, planId: string) {
  console.log('[Orange Money Polling] Starting polling for payment:', paymentId);

  try {
    const status = await orangeMoneyClient.pollPaymentStatus(paymentId);

    if (status.status === 'SUCCESS') {
      // Simulate webhook event
      await handlePaymentSuccess({
        payment_id: paymentId,
        amount: status.amount,
        currency: status.currency,
        metadata: { userId, planId },
      });
    } else if (status.status === 'FAILED') {
      // Simulate webhook event
      await handlePaymentFailure({
        payment_id: paymentId,
        metadata: { userId },
      });
    } else if (status.status === 'TIMEOUT') {
      // Mark payment as pending
      await prisma.payment.create({
        data: {
          userId,
          amount: 0,
          currency: 'XOF',
          provider: 'orange_money',
          providerPaymentId: paymentId,
          status: 'pending',
        },
      });
    }
  } catch (error) {
    console.error('[Orange Money Polling] Error:', error);
  }
}

// These functions are the same as in the webhook handler
async function handlePaymentSuccess(event: any) {
  // ... (same implementation as webhook)
}

async function handlePaymentFailure(event: any) {
  // ... (same implementation as webhook)
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Webhook endpoint responds correctly
- [ ] Token verification works
- [ ] Invalid token rejected with 401
- [ ] payment.success creates subscription
- [ ] payment.failure updates status to past_due
- [ ] subscription.renewal updates period dates
- [ ] Payment records created for transactions
- [ ] Idempotency prevents duplicate processing
- [ ] All events logged to console
- [ ] Webhook returns 200 for success
- [ ] Webhook returns 400 for errors
- [ ] Polling fallback works if webhook fails

### Test Scenarios

Simulate Orange Money webhook events:

```bash
# Test payment.success
curl -X POST http://localhost:3000/api/webhooks/orange \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_webhook_secret" \
  -d '{
    "event_type": "payment.success",
    "payment_id": "om_pay_test_123",
    "amount": 15000,
    "currency": "XOF",
    "metadata": {
      "userId": "user_123",
      "planId": "plan_pro_xof"
    }
  }'
```

---

## 📝 Implementation Tasks

- [ ] Create webhook endpoint route
- [ ] Implement token verification
- [ ] Implement handlePaymentSuccess function
- [ ] Implement handlePaymentFailure function
- [ ] Implement handleSubscriptionRenewal function
- [ ] Add idempotency checking
- [ ] Add comprehensive logging
- [ ] Create polling fallback service
- [ ] Integrate polling with checkout flow
- [ ] Test with Orange Money test webhook
- [ ] Test polling fallback
- [ ] Document webhook endpoint in README
- [ ] Configure webhook URL in Orange Money dashboard

---

## 🎯 Definition of Done

- [ ] Webhook endpoint created and deployed
- [ ] Token verification working correctly
- [ ] All event types handled properly
- [ ] Subscription status updates correctly
- [ ] Payment records created for transactions
- [ ] Idempotency prevents duplicate processing
- [ ] Logging implemented for debugging
- [ ] Polling fallback implemented
- [ ] Tested with Orange Money test events
- [ ] Webhook URL configured in Orange dashboard (if available)
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.1 (Database Schema), Story 6.3c (Orange Money Integration)
- **Related**: Story 6.3d (Wave Webhook - patterns), Story 6.3 (Stripe Webhook)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📚 Technical Notes

**Orange Money Webhook Documentation**: https://developer.orange.com/apis/orange-money/

**Webhook Events**:
- `payment.success` - Successful payment
- `payment.failure` - Payment failure
- `subscription.renewal` - Monthly renewal

**Authentication**:
- Orange Money uses Bearer token authentication
- Token sent in `Authorization` header
- Verify token matches ORANGE_MONEY_WEBHOOK_SECRET

**Polling Fallback**:
- Orange Money webhooks may not be fully supported in all regions
- Implement polling as fallback mechanism
- Poll every 1s, 2s, 5s, 10s with exponential backoff
- Timeout after 5 minutes

**Idempotency**:
- Orange Money may send duplicate webhooks
- Store processed payment IDs in database
- Check payment ID before processing

**Error Handling**:
- Return 200 for successful processing
- Return 200 for duplicate events
- Return 400 for invalid payloads
- Return 401 for authentication failures
- Log all errors for debugging

**Testing**:
- Use Orange Money test environment
- Test with test phone numbers
- Verify both webhook and polling paths
- Test idempotency with duplicate events

---

## 📋 Dev Agent Record

### Agent Model Used
- TBD (to be filled by dev agent)

### Completion Notes
- TBD (to be filled by dev agent)

### File List
- TBD (to be filled by dev agent)
