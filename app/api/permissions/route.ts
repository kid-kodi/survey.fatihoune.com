import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/permissions
 * Get all available permissions (system permissions)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all permissions grouped by category
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        category: permission.category,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; name: string; description: string | null; category: string }>>);

    return NextResponse.json({
      permissions: groupedPermissions,
      allPermissions: permissions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
      })),
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
