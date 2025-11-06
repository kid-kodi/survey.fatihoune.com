import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { organizationRepository } from "@/lib/repositories/organization-repository";

/**
 * GET /api/organizations/[id]/permissions
 * Get current user's permissions for an organization
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

    // Get user's role with permissions
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

    // Extract permission names
    const permissions = userRole.permissions.map((rp) => rp.permission.name);

    return NextResponse.json({
      role: userRole.name,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
