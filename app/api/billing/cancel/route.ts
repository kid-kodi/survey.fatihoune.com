import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/services/stripe';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers()),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Verify ownership
    if (subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already cancelled
    if (subscription.status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription already cancelled' }, { status: 400 });
    }

    // Cancel subscription based on provider
    if (subscription.paymentProvider === 'stripe' && subscription.providerSubscriptionId) {
      // Cancel Stripe subscription at period end
      await stripe.subscriptions.update(subscription.providerSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.currentPeriodEnd,
      });
    } else if (subscription.paymentProvider === 'wave') {
      // TODO: Implement Wave cancellation when Wave integration is complete
      return NextResponse.json(
        { error: 'Wave subscription cancellation not yet implemented' },
        { status: 501 }
      );
    } else if (subscription.paymentProvider === 'orange_money') {
      // TODO: Implement Orange Money cancellation when Orange Money integration is complete
      return NextResponse.json(
        { error: 'Orange Money subscription cancellation not yet implemented' },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
