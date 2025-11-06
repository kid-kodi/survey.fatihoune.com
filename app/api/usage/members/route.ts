import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkMemberLimit } from '@/lib/utils/subscription-limits';

export async function GET(request: Request) {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organizationId from query params
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const limitCheck = await checkMemberLimit(organizationId);

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
    console.error('Fetch member usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member usage' },
      { status: 500 }
    );
  }
}
