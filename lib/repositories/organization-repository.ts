import { prisma } from '@/lib/prisma';
import type { Organization, Role, OrganizationMember } from '@prisma/client';
import { generateSlug, makeSlugUnique } from '@/lib/utils/slug';

export class OrganizationRepository {
  /**
   * Find organization by ID
   */
  async findById(organizationId: string) {
    return prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            role: true,
          },
        },
        surveys: true,
        _count: {
          select: {
            members: true,
            surveys: true,
          },
        },
      },
    });
  }

  /**
   * Find organization by slug
   */
  async findBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find all organizations for a user
   */
  async findByUserId(userId: string) {
    return prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            surveys: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Generate a unique slug from organization name
   */
  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);

    // Find all existing slugs that start with the base slug
    const existingOrgs = await prisma.organization.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: {
        slug: true,
      },
    });

    const existingSlugs = existingOrgs.map((org) => org.slug);
    return makeSlugUnique(baseSlug, existingSlugs);
  }

  /**
   * Create organization with owner and default roles
   */
  async create(data: {
    name: string;
    description?: string;
    ownerId: string;
  }): Promise<Organization> {
    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.name);

    // First, get the system organization
    const systemOrg = await prisma.organization.findFirst({
      where: {
        slug: 'system'
      }
    });

    if (!systemOrg) {
      throw new Error('System organization not found');
    }

    // Get system roles for default org (Owner, Admin, Agent)
    const systemRoles = await prisma.role.findMany({
      where: {
        isSystemRole: true,
        organizationId: systemOrg.id
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (systemRoles.length !== 3) {
      throw new Error('System roles not properly seeded. Run: pnpm prisma db seed');
    }

    // Create organization with transaction
    const organization = await prisma.$transaction(async (tx) => {
      // 1. Create organization
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
        },
      });

      // 2. Create organization-specific copies of system roles
      const roleMapping: Record<string, string> = {};

      for (const systemRole of systemRoles) {
        const orgRole = await tx.role.create({
          data: {
            organizationId: org.id,
            name: systemRole.name,
            description: systemRole.description,
            isSystemRole: false, // Organization-specific copy
          },
        });

        roleMapping[systemRole.name] = orgRole.id;

        // Copy permissions
        for (const rp of systemRole.permissions) {
          await tx.rolePermission.create({
            data: {
              roleId: orgRole.id,
              permissionId: rp.permissionId,
            },
          });
        }
      }

      // 3. Add owner as organization member with Owner role
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: data.ownerId,
          roleId: roleMapping['Owner'],
        },
      });

      return org;
    });

    return organization;
  }

  /**
   * Update organization
   */
  async update(
    organizationId: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      // Regenerate slug if name changed
      updateData.slug = await this.generateUniqueSlug(data.name);
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    return prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });
  }

  /**
   * Delete organization
   */
  async delete(organizationId: string) {
    return prisma.organization.delete({
      where: { id: organizationId },
    });
  }

  /**
   * Check if user is member of organization
   */
  async isMember(organizationId: string, userId: string): Promise<boolean> {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    return member !== null;
  }

  /**
   * Get user's role in organization
   */
  async getUserRole(organizationId: string, userId: string) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return member?.role;
  }
}

export const organizationRepository = new OrganizationRepository();
