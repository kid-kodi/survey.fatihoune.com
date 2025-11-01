import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string }> }
) {
  try {
    const { uniqueId } = await params;

    // Fetch the survey by uniqueId (public access, no auth required)
    const survey = await prisma.survey.findUnique({
      where: {
        uniqueId: uniqueId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
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

    // Only allow access to published or archived surveys (not drafts)
    if (survey.status === "draft") {
      return NextResponse.json(
        { error: "Survey not available" },
        { status: 404 }
      );
    }

    // Return survey data (excluding sensitive fields like userId)
    return NextResponse.json({
      survey: {
        id: survey.id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        questions: survey.questions,
      },
    });
  } catch (error) {
    console.error("Fetch public survey error:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 }
    );
  }
}
