import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationRepository } from "@/lib/repositories/organization-repository";

// Validation schema for creating/updating roles
const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name must be less than 50 characters"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, "At least one permission is required"),
});

/**
 * GET /api/organizations/[id]/roles
 * Get all roles for an organization
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

    // Get all roles for the organization
    const roles = await prisma.role.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isSystemRole: true,
        _count: {
          select: {
            permissions: true,
            members: true,
          },
        },
      },
      orderBy: [
        { isSystemRole: "desc" }, // System roles first
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystemRole: role.isSystemRole,
        permissionCount: role._count.permissions,
        memberCount: role._count.members,
      })),
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[id]/roles
 * Create a new custom role
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
    const validationResult = roleSchema.safeParse(body);

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

    // Check if role name already exists in this organization
    const existingRole = await prisma.role.findFirst({
      where: {
        organizationId,
        name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 400 }
      );
    }

    // Verify all permission IDs exist
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

    // Create role with permissions in a transaction
    const role = await prisma.$transaction(async (tx) => {
      // Create the role
      const newRole = await tx.role.create({
        data: {
          organizationId,
          name,
          description,
          isSystemRole: false,
        },
      });

      // Create role-permission associations
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: newRole.id,
          permissionId,
        })),
      });

      // Fetch the complete role with permissions
      return await tx.role.findUnique({
        where: { id: newRole.id },
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

    return NextResponse.json(
      {
        role: {
          id: role!.id,
          name: role!.name,
          description: role!.description,
          isSystemRole: role!.isSystemRole,
          permissions: role!.permissions.map((rp) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            description: rp.permission.description,
            category: rp.permission.category,
          })),
          memberCount: role!._count.members,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
