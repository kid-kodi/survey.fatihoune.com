# Story 6.3d: Wave Webhook Handler

**Status**: 📝 Draft
**Epic**: Epic 6 - Subscription & Billing Management
**Story Number**: 6.3d
**Date Created**: 2025-11-05
**Estimated Effort**: 4-6 hours

---

## 📋 Story Overview

**User Story**:
As a developer, I want to handle Wave webhook events to sync payment and subscription status, so that Wave subscription changes are reflected in the database in real-time.

**Business Value**:
Webhook handling ensures that subscription status is immediately updated when Wave processes payments, renewals, or cancellations. This provides a seamless user experience and accurate subscription state management without requiring manual polling.

**Dependencies**:
- ✅ Story 6.1: Database Schema (REQUIRED)
- ✅ Story 6.3b: Wave Integration Setup (REQUIRED)

---

## ✅ Acceptance Criteria

**Webhook Endpoint:**
1. Wave webhook endpoint created (POST /api/webhooks/wave)
2. Webhook signature verification implemented for security

**Event Handling - Payment Completed:**
3. Webhook handles event: payment.completed (successful payment)
4. payment.completed creates Subscription record with status 'active'

**Event Handling - Payment Failed:**
5. Webhook handles event: payment.failed (payment failure)
6. payment.failed updates Subscription status to 'past_due'

**Event Handling - Subscription Renewed:**
7. Webhook handles event: subscription.renewed (monthly renewal)
8. subscription.renewed updates Subscription period dates

**Event Handling - Subscription Cancelled:**
9. Webhook handles event: subscription.cancelled (user cancellation)
10. subscription.cancelled updates Subscription status to 'cancelled'

**Payment Records:**
11. Payment record created in Payment model for each transaction

**Reliability:**
12. Webhook logs all events for debugging
13. Webhook returns 200 OK for processed events, 400 for errors
14. Idempotency handling prevents duplicate processing

---

## 🏗️ Technical Implementation

### Webhook Endpoint

```typescript
// app/api/webhooks/wave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Verify Wave webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WAVE_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('wave-signature');

    if (!signature) {
      console.error('Missing Wave signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid Wave webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Log event for debugging
    console.log('[Wave Webhook] Received event:', event.type, event.id);

    // Check idempotency - prevent duplicate processing
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { providerEventId: event.id },
    });

    if (existingEvent) {
      console.log('[Wave Webhook] Event already processed:', event.id);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: 'wave',
        providerEventId: event.id,
        eventType: event.type,
        payload: event,
        processedAt: new Date(),
      },
    });

    // Handle different event types
    switch (event.type) {
      case 'payment.completed':
        await handlePaymentCompleted(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(event);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;

      default:
        console.log('[Wave Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error: any) {
    console.error('[Wave Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 400 }
    );
  }
}

async function handlePaymentCompleted(event: any) {
  const { metadata, amount, currency, payment_id } = event.data;
  const { userId, planId } = metadata;

  console.log('[Wave Webhook] Processing payment.completed for user:', userId);

  // Get plan details
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    console.error('[Wave Webhook] Plan not found:', planId);
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
        paymentProvider: 'wave',
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
        paymentProvider: 'wave',
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
      provider: 'wave',
      providerPaymentId: payment_id,
      status: 'completed',
      paidAt: new Date(),
    },
  });

  console.log('[Wave Webhook] Payment completed and subscription activated for user:', userId);
}

async function handlePaymentFailed(event: any) {
  const { metadata, payment_id } = event.data;
  const { userId } = metadata;

  console.log('[Wave Webhook] Processing payment.failed for user:', userId);

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

    console.log('[Wave Webhook] Subscription marked as past_due for user:', userId);
  }
}

async function handleSubscriptionRenewed(event: any) {
  const { subscription_id, current_period_start, current_period_end } = event.data;

  console.log('[Wave Webhook] Processing subscription.renewed:', subscription_id);

  // Find subscription by provider ID
  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subscription_id },
  });

  if (subscription) {
    // Update subscription period dates
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
        status: 'active',
      },
    });

    console.log('[Wave Webhook] Subscription renewed:', subscription_id);
  }
}

async function handleSubscriptionCancelled(event: any) {
  const { subscription_id } = event.data;

  console.log('[Wave Webhook] Processing subscription.cancelled:', subscription_id);

  // Find subscription by provider ID
  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subscription_id },
  });

  if (subscription) {
    // Update subscription status to cancelled
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' },
    });

    // Downgrade user to Free plan
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Free' },
    });

    if (freePlan) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { currentPlanId: freePlan.id },
      });
    }

    console.log('[Wave Webhook] Subscription cancelled:', subscription_id);
  }
}
```

### Database Migration for WebhookEvent

```prisma
// Add to prisma/schema.prisma
model WebhookEvent {
  id               String   @id @default(cuid())
  provider         String   // 'stripe', 'wave', 'orange_money'
  providerEventId  String   @unique
  eventType        String
  payload          Json
  processedAt      DateTime
  createdAt        DateTime @default(now())

  @@index([provider, eventType])
  @@index([providerEventId])
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Webhook endpoint responds correctly
- [ ] Signature verification works
- [ ] Invalid signature rejected with 401
- [ ] payment.completed creates subscription
- [ ] payment.failed updates status to past_due
- [ ] subscription.renewed updates period dates
- [ ] subscription.cancelled updates status
- [ ] Payment records created for transactions
- [ ] Idempotency prevents duplicate processing
- [ ] All events logged to console
- [ ] Webhook returns 200 for success
- [ ] Webhook returns 400 for errors

### Test Scenarios

Use Wave's webhook testing tool or simulate events:

```bash
# Test payment.completed
curl -X POST http://localhost:3000/api/webhooks/wave \
  -H "Content-Type: application/json" \
  -H "wave-signature: <signature>" \
  -d '{
    "id": "evt_test_123",
    "type": "payment.completed",
    "data": {
      "payment_id": "pay_test_123",
      "amount": 15000,
      "currency": "XOF",
      "metadata": {
        "userId": "user_123",
        "planId": "plan_pro_xof"
      }
    }
  }'
```

---

## 📝 Implementation Tasks

- [ ] Create webhook endpoint route
- [ ] Implement signature verification
- [ ] Add WebhookEvent model to Prisma schema
- [ ] Run Prisma migration
- [ ] Implement handlePaymentCompleted function
- [ ] Implement handlePaymentFailed function
- [ ] Implement handleSubscriptionRenewed function
- [ ] Implement handleSubscriptionCancelled function
- [ ] Add idempotency checking
- [ ] Add comprehensive logging
- [ ] Test with Wave webhook test tool
- [ ] Document webhook endpoint in README
- [ ] Configure webhook URL in Wave dashboard

---

## 🎯 Definition of Done

- [ ] Webhook endpoint created and deployed
- [ ] Signature verification working correctly
- [ ] All event types handled properly
- [ ] Subscription status updates correctly
- [ ] Payment records created for transactions
- [ ] Idempotency prevents duplicate processing
- [ ] Logging implemented for debugging
- [ ] Tested with Wave test events
- [ ] Webhook URL configured in Wave dashboard
- [ ] Code reviewed and merged

---

## 🔗 Related Stories

- **Depends On**: Story 6.1 (Database Schema), Story 6.3b (Wave Integration Setup)
- **Related**: Story 6.3 (Stripe Webhook Handler - patterns), Story 6.3e (Orange Money Webhook)
- **Epic**: Epic 6 - Subscription & Billing Management

---

## 📚 Technical Notes

**Wave Webhook Documentation**: https://developer.wave.com/docs/webhooks

**Webhook Events**:
- `payment.completed` - Successful payment
- `payment.failed` - Payment failure
- `subscription.renewed` - Monthly renewal
- `subscription.cancelled` - User-initiated cancellation

**Signature Verification**:
- Wave signs webhooks with HMAC SHA256
- Signature sent in `wave-signature` header
- Always verify signature before processing

**Idempotency**:
- Wave may send duplicate webhooks
- Store processed event IDs in database
- Check event ID before processing

**Error Handling**:
- Return 200 even for duplicate events
- Return 400 for invalid payloads
- Log all errors for debugging
- Retry mechanism on Wave's side for 400/500 responses

**Testing**:
- Use Wave's webhook testing tool in developer dashboard
- Test with all event types
- Verify signature validation
- Test idempotency with duplicate events

---

## 📋 Dev Agent Record

### Agent Model Used
- TBD (to be filled by dev agent)

### Completion Notes
- TBD (to be filled by dev agent)

### File List
- TBD (to be filled by dev agent)
