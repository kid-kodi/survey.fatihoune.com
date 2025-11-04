import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationRepository } from "@/lib/repositories/organization-repository";

// Validation schema for updating roles
const updateRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name must be less than 50 characters").optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required").optional(),
});

/**
 * GET /api/organizations/[id]/roles/[roleId]
 * Get a specific role with its permissions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  try {
    const { id: organizationId, roleId } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get the role with permissions
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!role || role.organizationId !== organizationId) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystemRole: role.isSystemRole,
        permissions: role.permissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          category: rp.permission.category,
        })),
        memberCount: role._count.members,
      },
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]/roles/[roleId]
 * Update a custom role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  try {
    const { id: organizationId, roleId } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, description, permissionIds } = validationResult.data;

    // Check if user has permission to manage roles
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
      (rp) => rp.permission.name === "manage_roles"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to manage roles" },
        { status: 403 }
      );
    }

    // Get the role to update
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.organizationId !== organizationId) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Cannot edit system roles
    if (role.isSystemRole) {
      return NextResponse.json(
        { error: "Cannot edit system roles" },
        { status: 400 }
      );
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== role.name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          organizationId,
          name,
          id: {
            not: roleId,
          },
        },
      });

      if (existingRole) {
        return NextResponse.json(
          { error: "A role with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Verify all permission IDs exist (if permissions are being updated)
    if (permissionIds) {
      const permissions = await prisma.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      if (permissions.length !== permissionIds.length) {
        return NextResponse.json(
          { error: "One or more invalid permission IDs" },
          { status: 400 }
        );
      }
    }

    // Update role with permissions in a transaction
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Update the role
      const updated = await tx.role.update({
        where: { id: roleId },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
      });

      // Update permissions if provided
      if (permissionIds) {
        // Delete existing permissions
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        // Create new permissions
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      // Fetch the complete role with permissions
      return await tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      role: {
        id: updatedRole!.id,
        name: updatedRole!.name,
        description: updatedRole!.description,
        isSystemRole: updatedRole!.isSystemRole,
        permissions: updatedRole!.permissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          category: rp.permission.category,
        })),
        memberCount: updatedRole!._count.members,
      },
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]/roles/[roleId]
 * Delete a custom role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  try {
    const { id: organizationId, roleId } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage roles
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
      (rp) => rp.permission.name === "manage_roles"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to manage roles" },
        { status: 403 }
      );
    }

    // Get the role to delete
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!role || role.organizationId !== organizationId) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Cannot delete system roles
    if (role.isSystemRole) {
      return NextResponse.json(
        { error: "Cannot delete system roles" },
        { status: 400 }
      );
    }

    // Cannot delete role if it's assigned to members
    if (role._count.members > 0) {
      return NextResponse.json(
        { error: `This role is assigned to ${role._count.members} member(s) and cannot be deleted` },
        { status: 400 }
      );
    }

    // Delete role and its permissions in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Delete role
      await tx.role.delete({
        where: { id: roleId },
      });
    });

    return NextResponse.json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
