import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkSurveyLimit } from '@/lib/utils/subscription-limits';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is sys_admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isSysAdmin: true },
    });

    const limitCheck = await checkSurveyLimit(session.user.id);

    const percentage =
      limitCheck.limit === 'unlimited'
        ? 0
        : (limitCheck.current / (limitCheck.limit as number)) * 100;

    return NextResponse.json({
      current: limitCheck.current,
      limit: limitCheck.limit,
      percentage,
      isSysAdmin: user?.isSysAdmin || false,
    });
  } catch (error) {
    console.error('Fetch usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
