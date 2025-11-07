import { prisma } from '@/lib/prisma';

export async function checkSurveyLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  message?: string;
}> {
  // Check if user is sys_admin (bypass all limits)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSysAdmin: true,
      subscriptions: {
        where: { status: 'active' },
        include: { plan: { include: { limits: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // sys_admin bypass: allow unlimited surveys
  if (user?.isSysAdmin) {
    return {
      allowed: true,
      current: 0,
      limit: 'unlimited',
    };
  }

  if (!user || !user.subscriptions[0]) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: 'No active subscription found',
    };
  }

  const subscription = user.subscriptions[0];
  const surveyLimit = subscription.plan.limits.find(
    (l) => l.limitType === 'surveys'
  );

  if (!surveyLimit) {
    return { allowed: true, current: 0, limit: 'unlimited' };
  }

  // Check for unlimited
  if (surveyLimit.limitValue === 'unlimited') {
    return { allowed: true, current: 0, limit: 'unlimited' };
  }

  const limit = parseInt(surveyLimit.limitValue);

  // Get current usage
  const usage = await prisma.usageTracking.findFirst({
    where: {
      userId,
      resourceType: 'survey',
      organizationId: null, // Personal surveys
    },
  });

  const current = usage?.currentCount || 0;

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `You've reached your survey limit (${limit} surveys). Upgrade to create more.`,
    };
  }

  return { allowed: true, current, limit };
}

export async function incrementSurveyUsage(
  userId: string,
  organizationId?: string | null
) {
  // Explicitly type the organizationId to handle Prisma's unique constraint requirements
  const orgId: string | null = organizationId ?? null;
  await prisma.usageTracking.upsert({
    where: {
      userId_organizationId_resourceType: {
        userId,
        organizationId: orgId as string,
        resourceType: 'survey',
      },
    },
    create: {
      userId,
      organizationId: orgId,
      resourceType: 'survey',
      currentCount: 1,
    },
    update: {
      currentCount: { increment: 1 },
    },
  });
}

export async function decrementSurveyUsage(
  userId: string,
  organizationId?: string | null
) {
  await prisma.usageTracking.updateMany({
    where: {
      userId,
      organizationId: organizationId ?? null,
      resourceType: 'survey',
    },
    data: {
      currentCount: { decrement: 1 },
    },
  });
}

export async function checkOrganizationLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number | null;
}> {
  // Check if user is sys_admin (bypass all limits)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSysAdmin: true,
      subscriptions: {
        where: { status: 'active' },
        include: { plan: { include: { limits: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // sys_admin bypass: allow unlimited organizations
  if (user?.isSysAdmin) {
    return {
      allowed: true,
      currentCount: 0,
      limit: null,
    };
  }

  if (!user || !user.subscriptions[0]) {
    return { allowed: false, reason: 'No active subscription plan', currentCount: 0, limit: 0 };
  }

  const subscription = user.subscriptions[0];
  const limit = subscription.plan.limits.find(
    (l) => l.limitType === 'organizations'
  );

  // Unlimited for Premium (no limit defined or unlimited value)
  if (!limit || limit.limitValue === 'unlimited') {
    return { allowed: true, currentCount: 0, limit: null };
  }

  // Get current organization count
  const usageTracking = await prisma.usageTracking.findFirst({
    where: {
      userId,
      resourceType: 'organization',
    },
  });

  const currentCount = usageTracking?.currentCount || 0;
  const limitValue = parseInt(limit.limitValue);

  // Free plan: 0 organizations allowed
  if (limitValue === 0) {
    return {
      allowed: false,
      reason: 'organization_upgrade_required',
      currentCount,
      limit: limitValue,
    };
  }

  // Pro plan: Check if limit reached
  if (currentCount >= limitValue) {
    return {
      allowed: false,
      reason: 'organization_limit_reached',
      currentCount,
      limit: limitValue,
    };
  }

  return { allowed: true, currentCount, limit: limitValue };
}

export async function incrementOrganizationCount(userId: string) {
  const existing = await prisma.usageTracking.findFirst({
    where: {
      userId,
      organizationId: null,
      resourceType: 'organization',
    },
  });

  if (existing) {
    await prisma.usageTracking.update({
      where: { id: existing.id },
      data: {
        currentCount: { increment: 1 },
        lastUpdated: new Date(),
      },
    });
  } else {
    await prisma.usageTracking.create({
      data: {
        userId,
        organizationId: null,
        resourceType: 'organization',
        currentCount: 1,
      },
    });
  }
}

export async function decrementOrganizationCount(userId: string) {
  const existing = await prisma.usageTracking.findFirst({
    where: {
      userId,
      resourceType: 'organization',
    },
  });

  if (existing && existing.currentCount > 0) {
    await prisma.usageTracking.update({
      where: { id: existing.id },
      data: {
        currentCount: { decrement: 1 },
        lastUpdated: new Date(),
      },
    });
  }
}

export async function checkMemberLimit(
  organizationId: string
): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number | null;
}> {
  // Get organization with members, invitations, and owner
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        include: {
          role: true,
          user: {
            select: {
              isSysAdmin: true,
              subscriptions: {
                where: { status: 'active' },
                include: {
                  plan: {
                    include: {
                      limits: {
                        where: { limitType: 'users' },
                      },
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
      invitations: {
        where: {
          expiresAt: {
            gte: new Date(),
          },
        },
      },
    },
  });

  if (!organization) {
    return { allowed: false, reason: 'Organization not found', currentCount: 0, limit: 0 };
  }

  // Find the owner member
  const ownerMember = organization.members.find((m) => m.role.name === 'Owner');

  if (!ownerMember) {
    return {
      allowed: false,
      reason: 'Organization owner not found',
      currentCount: 0,
      limit: 0,
    };
  }

  // sys_admin bypass: check if organization owner is sys_admin
  if (ownerMember.user.isSysAdmin) {
    return {
      allowed: true,
      currentCount: 0,
      limit: null,
    };
  }

  const subscription = ownerMember.user.subscriptions[0];

  if (!subscription) {
    return {
      allowed: false,
      reason: 'No active subscription plan',
      currentCount: 0,
      limit: 0,
    };
  }

  const limit = subscription.plan.limits[0];

  // Unlimited for Premium (no limit defined or unlimited value)
  if (!limit || limit.limitValue === 'unlimited') {
    return { allowed: true, currentCount: 0, limit: null };
  }

  const limitValue = parseInt(limit.limitValue);

  // Count active members + pending invitations (non-expired)
  const currentCount = organization.members.length + organization.invitations.length;

  if (currentCount >= limitValue) {
    return {
      allowed: false,
      reason: 'member_limit_reached',
      currentCount,
      limit: limitValue,
    };
  }

  return { allowed: true, currentCount, limit: limitValue };
}

export async function validateDowngrade(
  userId: string,
  newPlanId: string
): Promise<{
  allowed: boolean;
  violations: Array<{ type: string; current: number; limit: number }>;
}> {
  const newPlan = await prisma.subscriptionPlan.findUnique({
    where: { id: newPlanId },
    include: { limits: true },
  });

  if (!newPlan) {
    throw new Error('Invalid plan');
  }

  const violations: Array<{ type: string; current: number; limit: number }> = [];

  // Map LimitType to ResourceType (plural to singular)
  const limitTypeToResourceType: Record<string, string> = {
    surveys: 'survey',
    organizations: 'organization',
    users: 'user',
  };

  // Check each limit type
  for (const limit of newPlan.limits) {
    if (limit.limitValue === 'unlimited') continue;

    const limitValue = parseInt(limit.limitValue);
    const resourceType = limitTypeToResourceType[limit.limitType];

    if (!resourceType) continue;

    // Get current usage for this resource type
    const usage = await prisma.usageTracking.findFirst({
      where: {
        userId,
        resourceType: resourceType as 'survey' | 'organization' | 'user',
        organizationId: null, // Personal usage only
      },
    });

    const currentCount = usage?.currentCount || 0;

    if (currentCount > limitValue) {
      violations.push({
        type: limit.limitType,
        current: currentCount,
        limit: limitValue,
      });
    }
  }

  return {
    allowed: violations.length === 0,
    violations,
  };
}
