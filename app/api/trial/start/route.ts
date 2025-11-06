import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has already used their trial
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasUsedTrial: true },
    });

    if (user?.hasUsedTrial) {
      return NextResponse.json(
        { error: 'You have already used your free trial' },
        { status: 400 }
      );
    }

    // Check if user already has an active trial subscription
    const existingTrialSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'trialing',
      },
    });

    if (existingTrialSubscription) {
      return NextResponse.json(
        { error: 'You already have an active trial' },
        { status: 400 }
      );
    }

    // Get the Pro plan
    const proPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: 'Pro',
        currency: 'USD',
        isActive: true,
      },
    });

    if (!proPlan) {
      return NextResponse.json(
        { error: 'Pro plan not found' },
        { status: 404 }
      );
    }

    // Calculate trial period (14 days from now)
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    // Create trial subscription and update user in a transaction
    const subscription = await prisma.$transaction(async (tx) => {
      // Create trial subscription
      const newSubscription = await tx.subscription.create({
        data: {
          userId,
          planId: proPlan.id,
          status: 'trialing',
          paymentProvider: 'stripe', // Default to Stripe
          currentPeriodStart: trialStart,
          currentPeriodEnd: trialEnd,
          cancelAtPeriodEnd: false,
        },
      });

      // Update user's current plan and mark trial as used
      await tx.user.update({
        where: { id: userId },
        data: {
          currentPlanId: proPlan.id,
          hasUsedTrial: true,
        },
      });

      return newSubscription;
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trialEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error('Trial start error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start trial',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
