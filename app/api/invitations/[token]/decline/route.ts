import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInvitationExpired } from "@/lib/utils/invitation";

/**
 * POST /api/invitations/[token]/decline
 * Decline an organization invitation
 * Note: Does not require authentication - anyone with token can decline
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if expired (still allow declining expired invitations)
    const expired = isInvitationExpired(invitation.expiresAt);

    // Delete invitation
    await prisma.organizationInvitation.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({
      message: expired
        ? "Expired invitation removed"
        : "Invitation declined successfully",
    });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return NextResponse.json(
      { error: "Failed to decline invitation" },
      { status: 500 }
    );
  }
}
