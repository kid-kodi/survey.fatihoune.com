import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSysAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ImpersonateSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Require sys_admin access
    const adminUser = await requireSysAdmin();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ImpersonateSchema.parse(body);
    const { targetUserId, reason } = validatedData;

    // Check if already impersonating
    const existingImpersonation = await prisma.impersonationSession.findFirst({
      where: {
        adminId: adminUser.id,
        endedAt: null,
      },
    });

    if (existingImpersonation) {
      return NextResponse.json(
        { error: "Already impersonating a user. Stop current impersonation first." },
        { status: 403 }
      );
    }

    // Fetch target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        isSysAdmin: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Prevent impersonating another sys_admin
    if (targetUser.isSysAdmin) {
      return NextResponse.json(
        { error: "Cannot impersonate another system administrator" },
        { status: 403 }
      );
    }

    // Get IP address and user agent
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create ImpersonationSession record
    const impersonationSession = await prisma.impersonationSession.create({
      data: {
        adminId: adminUser.id,
        targetUserId: targetUser.id,
        reason: reason || null,
        ipAddress,
        userAgent,
      },
    });

    // Create AdminAction record
    await prisma.adminAction.create({
      data: {
        adminId: adminUser.id,
        action: "impersonate_user",
        targetResource: `user:${targetUser.id}`,
        metadata: {
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.name,
          reason: reason || null,
          impersonationSessionId: impersonationSession.id,
        },
      },
    });

    // Impersonation is now active
    // The getCurrentUser function will automatically return the target user
    // when it detects an active impersonation session

    return NextResponse.json({
      success: true,
      sessionId: impersonationSession.id,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error("Error starting impersonation:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage === "Unauthorized" || errorMessage === "Forbidden: sys_admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to start impersonation" },
      { status: 500 }
    );
  }
}
