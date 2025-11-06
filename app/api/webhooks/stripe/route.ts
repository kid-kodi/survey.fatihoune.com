import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/services/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Extended types for Stripe objects with missing properties
type ExtendedSubscription = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
};

type ExtendedInvoice = Stripe.Invoice & {
  subscription: string | null;
  payment_intent: string | null;
  amount_paid: number;
  status_transitions: {
    paid_at: number | null;
  };
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log('Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  ) as unknown as ExtendedSubscription;

  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    throw new Error('Missing metadata in checkout session');
  }

  // Idempotency check: Return if subscription already exists
  const existingSubscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId: subscription.id },
  });

  if (existingSubscription) {
    console.log(`Subscription ${subscription.id} already exists, skipping creation`);
    return;
  }

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      paymentProvider: 'stripe',
      providerSubscriptionId: subscription.id,
      providerCustomerId: subscription.customer as string,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  // Update user's current plan
  await prisma.user.update({
    where: { id: userId },
    data: { currentPlanId: planId },
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const extendedSubscription = subscription as ExtendedSubscription;
  await prisma.subscription.update({
    where: { providerSubscriptionId: subscription.id },
    data: {
      status: subscription.status === 'active' ? 'active' :
              subscription.status === 'canceled' ? 'cancelled' :
              subscription.status === 'past_due' ? 'past_due' : 'active',
      currentPeriodStart: new Date(extendedSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(extendedSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: extendedSubscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId: subscription.id },
    include: { user: true },
  });

  if (!dbSubscription) return;

  // Update subscription status
  await prisma.subscription.update({
    where: { providerSubscriptionId: subscription.id },
    data: { status: 'cancelled' },
  });

  // Get Free plan
  const freePlan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'Free', currency: 'USD' },
  });

  if (freePlan) {
    // Downgrade user to Free plan
    await prisma.user.update({
      where: { id: dbSubscription.userId },
      data: { currentPlanId: freePlan.id },
    });
  }

  console.log(`Subscription cancelled: ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const extendedInvoice = invoice as unknown as ExtendedInvoice;
  if (!extendedInvoice.subscription) return;

  const subscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId: extendedInvoice.subscription },
  });

  if (!subscription) return;

  // Idempotency check: Return if payment already exists
  if (extendedInvoice.payment_intent) {
    const existingPayment = await prisma.payment.findUnique({
      where: { providerPaymentId: extendedInvoice.payment_intent },
    });

    if (existingPayment) {
      console.log(`Payment ${extendedInvoice.payment_intent} already exists, skipping creation`);
      return;
    }
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      userId: subscription.userId,
      amount: (extendedInvoice.amount_paid || 0) / 100,
      currency: invoice.currency.toUpperCase() as 'USD' | 'EUR' | 'XOF',
      provider: 'stripe',
      providerPaymentId: extendedInvoice.payment_intent as string,
      status: 'completed',
      paidAt: new Date((extendedInvoice.status_transitions?.paid_at || Date.now() / 1000) * 1000),
    },
  });

  // Update subscription to active if it was past_due
  if (subscription.status === 'past_due') {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'active' },
    });
  }

  console.log(`Payment succeeded for subscription ${subscription.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const extendedInvoice = invoice as unknown as ExtendedInvoice;
  if (!extendedInvoice.subscription) return;

  await prisma.subscription.update({
    where: { providerSubscriptionId: extendedInvoice.subscription },
    data: { status: 'past_due' },
  });

  console.log(`Payment failed for subscription ${extendedInvoice.subscription}`);
}
