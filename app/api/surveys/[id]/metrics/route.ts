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

    const { id: surveyId } = await params;

    // Fetch survey to verify ownership
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        _count: {
          select: {
            responses: true,
            questions: true,
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

    // Check authorization
    if (survey.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get total responses count
    const totalResponses = survey._count.responses;

    // Note: Completion rate based on views is out of scope for MVP
    // We can calculate it based on average answered questions as an alternative
    // For now, we'll return N/A or omit it as per requirements

    // Optional: Calculate completion rate based on average answered questions
    let completionRate: number | null = null;

    if (totalResponses > 0 && survey._count.questions > 0) {
      // Get all responses with their answers
      const responses = await prisma.response.findMany({
        where: { surveyId },
        select: { answers: true },
      });

      // Calculate average number of questions answered per response
      const totalAnswered = responses.reduce((sum:number, response:any) => {
        const answers = response.answers as any[];
        // Count non-null, non-empty answers
        const answeredCount = answers.filter(
          (a) => a.answer !== null && a.answer !== ""
        ).length;
        return sum + answeredCount;
      }, 0);

      const avgAnswered = totalAnswered / totalResponses;
      completionRate = (avgAnswered / survey._count.questions) * 100;
    }

    return NextResponse.json({
      metrics: {
        totalResponses,
        completionRate,
        questionCount: survey._count.questions,
      },
    });
  } catch (error) {
    console.error("Fetch metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
