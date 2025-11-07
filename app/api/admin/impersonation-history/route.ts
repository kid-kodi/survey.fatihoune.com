import { NextRequest, NextResponse } from "next/server";
import { requireSysAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Require sys_admin access
    await requireSysAdmin();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all"; // all, active, completed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause based on filter
    type WhereClause = {
      endedAt?: null | { not: null };
    };
    const where: WhereClause = {};
    if (filter === "active") {
      where.endedAt = null;
    } else if (filter === "completed") {
      where.endedAt = { not: null };
    }

    // Fetch impersonation sessions
    const [sessions, total] = await Promise.all([
      prisma.impersonationSession.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.impersonationSession.count({ where }),
    ]);

    return NextResponse.json({
      sessions,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching impersonation history:", error);

    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage === "Unauthorized" || errorMessage === "Forbidden: sys_admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch impersonation history" },
      { status: 500 }
    );
  }
}
