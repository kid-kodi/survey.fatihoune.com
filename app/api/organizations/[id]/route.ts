import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { organizationRepository } from "@/lib/repositories/organization-repository";

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

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

    // Get organization with role info
    const organization = await organizationRepository.findById(organizationId);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get user's role in this organization
    const userRole = await organizationRepository.getUserRole(
      organizationId,
      session.user.id
    );

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description,
        role: userRole?.name || "Member",
        memberCount: organization.members.length,
        surveyCount: organization.surveys?.length || 0,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
