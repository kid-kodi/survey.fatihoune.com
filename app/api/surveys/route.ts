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

    // Fetch all surveys for the authenticated user
    const surveys = await prisma.survey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        uniqueId: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        _count: {
          select: {
            responses: true,
            questions: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      surveys: surveys.map((survey) => ({
        id: survey.id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        publishedAt: survey.publishedAt,
        responseCount: survey._count.responses,
        questionCount: survey._count.questions,
      })),
    });
  } catch (error) {
    console.error("Fetch surveys error:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}
