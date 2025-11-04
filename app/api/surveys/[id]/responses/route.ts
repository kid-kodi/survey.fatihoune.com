import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { canViewAnalytics } from "@/lib/utils/visibility";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: surveyId } = await params;

    // Fetch survey to verify access
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: {
        id: true,
        userId: true,
        title: true,
        visibility: true,
        organizationId: true,
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    // Get user's organization memberships and permissions for access control
    const userOrgMemberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      select: {
        organizationId: true,
        role: {
          select: {
            permissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const orgIds = userOrgMemberships.map((m) => m.organizationId);
    const permissions = userOrgMemberships.flatMap((m) =>
      m.role.permissions.map((p) => p.permission.name)
    );

    // Check if user can view responses based on visibility rules
    if (!canViewAnalytics(survey, session.user.id, orgIds, permissions)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    // Fetch responses with pagination
    const [responses, totalCount] = await Promise.all([
      prisma.response.findMany({
        where: { surveyId },
        select: {
          id: true,
          answers: true,
          submittedAt: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.response.count({
        where: { surveyId },
      }),
    ]);

    return NextResponse.json({
      responses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Fetch responses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
