import { NextRequest, NextResponse } from "next/server";
import { requireSysAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Require sys_admin access
    await requireSysAdmin();

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Build where clause
    const where: {
      action?: string;
      targetResource?: {
        contains: string;
        mode: "insensitive";
      };
    } = {};

    // Filter by action type
    if (action) {
      where.action = action;
    }

    // Search by target resource
    if (search) {
      where.targetResource = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Get total count
    const total = await prisma.adminAction.count({ where });

    // Get paginated actions
    const actions = await prisma.adminAction.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        performedAt: "desc",
      },
    });

    return NextResponse.json({
      actions,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage === "Unauthorized" ||
      errorMessage === "Forbidden: sys_admin access required"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}
