import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkOrganizationLimit } from '@/lib/utils/subscription-limits';

export async function GET() {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limitCheck = await checkOrganizationLimit(session.user.id);

    const percentage =
      limitCheck.limit === null
        ? 0
        : (limitCheck.currentCount / limitCheck.limit) * 100;

    return NextResponse.json({
      current: limitCheck.currentCount,
      limit: limitCheck.limit === null ? 'unlimited' : limitCheck.limit,
      percentage,
    });
  } catch (error) {
    console.error('Fetch organization usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization usage' },
      { status: 500 }
    );
  }
}
