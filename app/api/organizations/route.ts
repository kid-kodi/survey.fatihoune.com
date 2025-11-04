import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { organizationRepository } from '@/lib/repositories/organization-repository';

// Validation schema for creating organization
const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters')
    .trim(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

/**
 * GET /api/organizations
 * Get all organizations for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizations = await organizationRepository.findByUserId(session.user.id);

    return NextResponse.json({
      organizations: organizations.map((org:any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        role: org.members[0]?.role.name,
        memberCount: org._count.members,
        surveyCount: org._count.surveys,
      })),
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = createOrganizationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;

    // Create organization with owner and default roles
    const organization = await organizationRepository.create({
      name,
      description,
      ownerId: session.user.id,
    });

    // Fetch the complete organization with member info
    const completeOrg = await organizationRepository.findById(organization.id);

    return NextResponse.json(
      {
        organization: {
          id: completeOrg!.id,
          name: completeOrg!.name,
          slug: completeOrg!.slug,
          description: completeOrg!.description,
          createdAt: completeOrg!.createdAt,
          updatedAt: completeOrg!.updatedAt,
          role: 'Owner',
          memberCount: completeOrg!._count.members,
          surveyCount: completeOrg!._count.surveys,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);

    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message.includes('System roles not properly seeded')) {
        return NextResponse.json(
          {
            error: 'System configuration error',
            message:
              'Organization roles are not properly configured. Please contact administrator.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
