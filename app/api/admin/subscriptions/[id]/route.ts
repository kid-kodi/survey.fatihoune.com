import { NextRequest, NextResponse } from "next/server";
import { requireSysAdmin, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  extendPeriodDays: z.number().positive().optional(),
  newPlanId: z.string().optional(),
  customLimits: z
    .object({
      maxSurveys: z.union([z.number(), z.literal("unlimited")]).optional(),
      maxOrganizations: z.union([z.number(), z.literal("unlimited")]).optional(),
      maxMembersPerOrg: z.union([z.number(), z.literal("unlimited")]).optional(),
    })
    .optional(),
  reason: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require sys_admin access
    await requireSysAdmin();

    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: subscriptionId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { extendPeriodDays, newPlanId, customLimits, reason } = validation.data;

    // Fetch existing subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    const adminActions: any[] = [];

    // 1. Extend Period
    if (extendPeriodDays && subscription.currentPeriodEnd) {
      const currentEnd = new Date(subscription.currentPeriodEnd);
      const newEnd = new Date(currentEnd);
      newEnd.setDate(currentEnd.getDate() + extendPeriodDays);

      updateData.currentPeriodEnd = newEnd;

      adminActions.push({
        adminId: admin.id,
        action: "extend_subscription_period",
        targetResource: `subscription:${subscriptionId}`,
        metadata: {
          userId: subscription.userId,
          extendedDays: extendPeriodDays,
          oldEnd: currentEnd.toISOString(),
          newEnd: newEnd.toISOString(),
          reason: reason || null,
        },
      });
    }

    // 2. Change Plan
    if (newPlanId && newPlanId !== subscription.planId) {
      // Validate new plan exists
      const newPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: newPlanId },
        select: { id: true, name: true },
      });

      if (!newPlan) {
        return NextResponse.json(
          { error: "Invalid plan ID" },
          { status: 400 }
        );
      }

      updateData.planId = newPlanId;

      adminActions.push({
        adminId: admin.id,
        action: "change_subscription_plan",
        targetResource: `subscription:${subscriptionId}`,
        metadata: {
          userId: subscription.userId,
          oldPlanId: subscription.plan.id,
          oldPlanName: subscription.plan.name,
          newPlanId: newPlan.id,
          newPlanName: newPlan.name,
          reason: reason || null,
        },
      });

      // Also update user's currentPlanId
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { currentPlanId: newPlanId },
      });
    }

    // 3. Custom Limits
    if (customLimits) {
      // Get existing metadata or create new
      const existingMetadata =
        typeof subscription.metadata === "object" && subscription.metadata !== null
          ? subscription.metadata
          : {};

      updateData.metadata = {
        ...existingMetadata,
        customLimits: customLimits,
      };

      adminActions.push({
        adminId: admin.id,
        action: "set_custom_limits",
        targetResource: `subscription:${subscriptionId}`,
        metadata: {
          userId: subscription.userId,
          customLimits: customLimits,
          reason: reason || null,
        },
      });
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
          },
        },
      },
    });

    // Create AdminAction records
    const createdActions = await prisma.adminAction.createMany({
      data: adminActions,
    });

    return NextResponse.json({
      subscription: updatedSubscription,
      actionsLogged: createdActions.count,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage === "Unauthorized" ||
      errorMessage === "Forbidden: sys_admin access required"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update subscription", message: errorMessage },
      { status: 500 }
    );
  }
}
