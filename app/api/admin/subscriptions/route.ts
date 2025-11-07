import { NextRequest, NextResponse } from "next/server";
import { requireSysAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Require sys_admin access
    await requireSysAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const status = searchParams.get("status") || "";
    const provider = searchParams.get("provider") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // Build where clause
    const where: any = {};

    // Search by user email or name
    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Filter by plan name
    if (plan) {
      where.plan = {
        name: { contains: plan, mode: "insensitive" },
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by payment provider
    if (provider) {
      where.paymentProvider = provider;
    }

    // Get total count
    const total = await prisma.subscription.count({ where });

    // Get paginated subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      subscriptions,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage === "Unauthorized" ||
      errorMessage === "Forbidden: sys_admin access required"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
