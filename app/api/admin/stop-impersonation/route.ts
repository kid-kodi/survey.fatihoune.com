import { NextResponse } from "next/server";
import { getActualUser, getActiveImpersonation } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Get the actual admin user (not impersonated)
    const adminUser = await getActualUser();

    if (!adminUser || !adminUser.isSysAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get active impersonation session
    const activeImpersonation = await getActiveImpersonation();

    if (!activeImpersonation) {
      return NextResponse.json(
        { error: "No active impersonation session found" },
        { status: 404 }
      );
    }

    // Calculate duration
    const duration = Math.floor(
      (Date.now() - new Date(activeImpersonation.startedAt).getTime()) / 1000
    );

    // End the impersonation session
    await prisma.impersonationSession.update({
      where: { id: activeImpersonation.id },
      data: { endedAt: new Date() },
    });

    // Create AdminAction record
    await prisma.adminAction.create({
      data: {
        adminId: adminUser.id,
        action: "stop_impersonation",
        targetResource: `user:${activeImpersonation.targetUserId}`,
        metadata: {
          impersonationSessionId: activeImpersonation.id,
          duration,
          targetUserEmail: activeImpersonation.targetUser.email,
          targetUserName: activeImpersonation.targetUser.name,
        },
      },
    });

    // Session is automatically restored since getCurrentUser checks for active impersonation
    // and will now return the admin user instead of the target user

    return NextResponse.json({
      success: true,
      duration,
    });
  } catch (error) {
    console.error("Error stopping impersonation:", error);

    return NextResponse.json(
      { error: "Failed to stop impersonation" },
      { status: 500 }
    );
  }
}
