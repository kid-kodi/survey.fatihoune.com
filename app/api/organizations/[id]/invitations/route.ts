import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationRepository } from "@/lib/repositories/organization-repository";
import {
  generateInvitationToken,
  getInvitationExpiration,
} from "@/lib/utils/invitation";
import { sendEmail } from "@/lib/services/email-service";
import {
  OrganizationInvitationEmail,
  getInvitationEmailSubject,
} from "@/lib/email-templates/OrganizationInvitationEmail";
import { checkMemberLimit } from "@/lib/utils/subscription-limits";

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

    // Check member limit before proceeding
    const limitCheck = await checkMemberLimit(organizationId);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason,
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
        },
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

    // Generate invitation URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invitations/${token}`;
    const declineUrl = `${baseUrl}/invitations/${token}/decline`;

    // Calculate days until expiration
    const expiresInDays = Math.ceil(
      (invitation.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Determine locale (use inviter's locale if available, fallback to 'en')
    // For MVP: we'll use 'en' as default since user locale isn't stored yet
    // TODO: Get locale from user preferences when implemented
    const locale = 'en'; // Can be enhanced to: session.user.locale || 'en'

    // Send invitation email
    let emailSent = false;
    try {
      const result = await sendEmail({
        to: email,
        subject: getInvitationEmailSubject(invitation.organization.name, locale),
        react: OrganizationInvitationEmail({
          inviteeName: email,
          inviterName: invitation.inviter.name || invitation.inviter.email || 'A team member',
          organizationName: invitation.organization.name,
          roleName: role.name,
          invitationUrl,
          declineUrl,
          expiresInDays,
          locale,
        }),
      });

      emailSent = result.success;

      if (result.success) {
        console.log(`✅ Invitation email sent to ${email}`);
      } else {
        console.error(`❌ Failed to send invitation email to ${email}:`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error sending invitation email to ${email}:`, error);
      // Don't fail the request - invitation is still created
    }

    // Log URL for development/testing
    if (process.env.NODE_ENV === 'development') {
      console.log("📧 Invitation URL:", invitationUrl);
      console.log(`Invite ${email} to join ${invitation.organization.name} as ${role.name}`);
    }

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          email: invitation.inviteeEmail,
          role: role.name,
          expiresAt: invitation.expiresAt,
          invitationUrl, // Return URL for testing/development
          emailSent, // Indicate whether email was successfully sent
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
