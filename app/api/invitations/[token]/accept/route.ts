import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isInvitationExpired } from "@/lib/utils/invitation";

/**
 * POST /api/invitations/[token]/accept
 * Accept an organization invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    // Find invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
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
        { status: 410 }
      );
    }

    // Verify email matches (optional - can be removed if you want to allow any authenticated user)
    if (session.user.email !== invitation.inviteeEmail) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      // Delete invitation and return success (idempotent)
      await prisma.organizationInvitation.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json({
        message: "You are already a member of this organization",
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
        },
      });
    }

    // Create organization member and delete invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create member
      const member = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: session.user.id,
          roleId: invitation.roleId,
        },
        include: {
          organization: true,
          role: true,
        },
      });

      // Delete invitation
      await tx.organizationInvitation.delete({
        where: { id: invitation.id },
      });

      return member;
    });

    return NextResponse.json({
      message: "Invitation accepted successfully",
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        role: result.role.name,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
