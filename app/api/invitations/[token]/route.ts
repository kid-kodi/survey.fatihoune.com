import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isInvitationExpired } from "@/lib/utils/invitation";

/**
 * GET /api/invitations/[token]
 * Get invitation details by token (for viewing invitation page)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (isInvitationExpired(invitation.expiresAt)) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 } // 410 Gone
      );
    }

    // Get role name
    const role = await prisma.role.findUnique({
      where: { id: invitation.roleId },
      select: { name: true },
    });

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        organizationId: invitation.organization.id,
        organizationName: invitation.organization.name,
        organizationDescription: invitation.organization.description,
        inviterName: invitation.inviter.name,
        roleName: role?.name || "Unknown",
        inviteeEmail: invitation.inviteeEmail,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
