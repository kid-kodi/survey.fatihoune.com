import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const preferenceSchema = z.object({
  preferredPaymentProvider: z.enum(['stripe', 'wave', 'orange_money']).optional(),
  preferredCurrency: z.enum(['USD', 'EUR', 'XOF']).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = preferenceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { preferredPaymentProvider, preferredCurrency } = validation.data;

    // Update user preferences
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(preferredPaymentProvider && { preferredPaymentProvider }),
        ...(preferredCurrency && { preferredCurrency }),
      },
    });

    return NextResponse.json({
      preferredPaymentProvider: user.preferredPaymentProvider,
      preferredCurrency: user.preferredCurrency,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        preferredPaymentProvider: true,
        preferredCurrency: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      preferredPaymentProvider: user.preferredPaymentProvider || 'stripe',
      preferredCurrency: user.preferredCurrency || 'USD',
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}
