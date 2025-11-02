import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

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

    const { id } = await params;

    // Fetch the survey
    const survey = await prisma.survey.findUnique({
      where: {
        id: id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    // Check if survey belongs to the authenticated user
    if (survey.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      survey: {
        id: survey.id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        publishedAt: survey.publishedAt,
        questions: survey.questions,
        responseCount: survey._count.responses,
      },
    });
  } catch (error) {
    console.error("Fetch survey error:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 }
    );
  }
}
