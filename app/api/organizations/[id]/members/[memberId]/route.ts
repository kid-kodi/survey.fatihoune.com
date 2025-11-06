import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationRepository } from "@/lib/repositories/organization-repository";

// Validation schema for updating member
const updateMemberSchema = z.object({
  roleId: z.string().min(1, "Role is required"),
});

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update a member's role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, memberId } = await params;
    const organizationId = id;
    const body = await request.json();

    // Validate request body
    const validationResult = updateMemberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { roleId } = validationResult.data;

    // Check if user has permission to manage users
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

    const hasPermission = userRole.permissions.some(
      (rp) => rp.permission.name === "manage_users"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to manage users" },
        { status: 403 }
      );
    }

    // Get the member to update
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        role: true,
      },
    });

    if (!member || member.organizationId !== organizationId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Verify the new role exists and belongs to this organization
    const newRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!newRole || newRole.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Invalid role for this organization" },
        { status: 400 }
      );
    }

    // Check if this is the last owner
    if (member.role.name === "Owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId,
          role: {
            name: "Owner",
          },
        },
      });

      if (ownerCount === 1 && newRole.name !== "Owner") {
        return NextResponse.json(
          { error: "Organization must have at least one owner" },
          { status: 400 }
        );
      }
    }

    // Update member's role
    const updatedMember = await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        roleId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        userId: updatedMember.user.id,
        name: updatedMember.user.name,
        email: updatedMember.user.email,
        role: updatedMember.role,
        joinedAt: updatedMember.joinedAt,
      },
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from the organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, memberId } = await params;
    const organizationId = id;

    // Check if user has permission to manage users
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

    const hasPermission = userRole.permissions.some(
      (rp) => rp.permission.name === "manage_users"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to manage users" },
        { status: 403 }
      );
    }

    // Get the member to remove
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
      include: {
        role: true,
      },
    });

    if (!member || member.organizationId !== organizationId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent removing yourself
    if (member.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself. Please use 'Leave Organization' instead." },
        { status: 400 }
      );
    }

    // Check if this is the last owner
    if (member.role.name === "Owner") {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId,
          role: {
            name: "Owner",
          },
        },
      });

      if (ownerCount === 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner of the organization" },
          { status: 400 }
        );
      }
    }

    // Delete the member
    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
