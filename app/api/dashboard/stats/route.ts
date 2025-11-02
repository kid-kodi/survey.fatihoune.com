import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Get aggregated stats for all user's surveys
    const userId = session.user.id;

    // Count total surveys
    const totalSurveys = await prisma.survey.count({
      where: {
        userId,
      },
    });

    // Count published surveys
    const surveysPublished = await prisma.survey.count({
      where: {
        userId,
        status: "published",
      },
    });

    // Count total responses across all surveys
    const totalResponses = await prisma.response.count({
      where: {
        survey: {
          userId,
        },
      },
    });

    // Get the most recent response date across all surveys
    const mostRecentResponse = await prisma.response.findFirst({
      where: {
        survey: {
          userId,
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      select: {
        submittedAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalSurveys,
        surveysPublished,
        totalResponses,
        lastResponseDate: mostRecentResponse?.submittedAt || null,
      },
    });
  } catch (error) {
    console.error("Fetch dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
