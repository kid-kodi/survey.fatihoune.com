import { NextRequest, NextResponse } from "next/server";
import { requireSysAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Require sys_admin access
    await requireSysAdmin();

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("search") || "";

    // If no search query, return empty array
    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    // Search users by email, name, or user ID
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { id: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isSysAdmin: true,
        createdAt: true,
      },
      take: 10, // Limit to 10 results
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "Unauthorized" || errorMessage === "Forbidden: sys_admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
