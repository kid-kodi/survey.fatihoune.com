import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationRepository } from "@/lib/repositories/organization-repository";
import {
  generateInvitationToken,
  getInvitationExpiration,
} from "@/lib/utils/invitation";

// Validation schema for inviting a member
const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
});

/**
 * GET /api/organizations/[id]/invitations
 * Get all pending invitations for an organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const organizationId = id;

    // Check if user is member of organization
    const isMember = await organizationRepository.isMember(
      organizationId,
      session.user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Get all pending invitations
    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId,
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get role names for invitations
    const invitationsWithRoles = await Promise.all(
      invitations.map(async (invitation) => {
        const role = await prisma.role.findUnique({
          where: { id: invitation.roleId },
          select: { name: true },
        });

        return {
          id: invitation.id,
          email: invitation.inviteeEmail,
          role: role?.name || "Unknown",
          roleId: invitation.roleId,
          inviter: invitation.inviter,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt,
        };
      })
    );

    return NextResponse.json({ invitations: invitationsWithRoles });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[id]/invitations
 * Send an invitation to join the organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const organizationId = id;
    const body = await request.json();

    // Validate request body
    const validationResult = inviteMemberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, roleId } = validationResult.data;

    // Check if user has permission to invite members (manage_users)
    const userRole = await organizationRepository.getUserRole(
      organizationId,
      session.user.id
    );

    if (!userRole) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    // Check for manage_users permission
    const hasPermission = userRole.permissions.some(
      (rp) => rp.permission.name === "manage_users"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to invite users" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Check if invitation already exists for this email
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId,
        inviteeEmail: email,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Verify role exists and belongs to organization
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Invalid role for this organization" },
        { status: 400 }
      );
    }

    // Generate invitation token and expiration
    const token = generateInvitationToken();
    const expiresAt = getInvitationExpiration();

    // Create invitation
    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId,
        inviterId: session.user.id,
        inviteeEmail: email,
        roleId,
        token,
        expiresAt,
      },
      include: {
        organization: true,
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email with invitation link
    // For now, we'll just log the invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invitations/${token}`;
    console.log("Invitation URL:", invitationUrl);
    console.log(
      `Invite ${email} to join ${invitation.organization.name} as ${role.name}`
    );

    // In production, you would send an email here:
    // await sendInvitationEmail({
    //   to: email,
    //   inviterName: invitation.inviter.name,
    //   organizationName: invitation.organization.name,
    //   roleName: role.name,
    //   invitationUrl,
    // });

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          email: invitation.inviteeEmail,
          role: role.name,
          expiresAt: invitation.expiresAt,
          invitationUrl, // Return URL for testing/development
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
