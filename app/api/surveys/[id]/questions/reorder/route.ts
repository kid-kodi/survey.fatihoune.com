import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function PATCH(
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
    const body = await request.json();
    const { questionIds } = body;

    // Validate request body
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: "questionIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate survey exists and belongs to user
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: true,
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    if (survey.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate all question IDs belong to this survey
    const surveyQuestionIds = survey.questions.map((q: { id: string }) => q.id);
    const invalidIds = questionIds.filter(
      (id: string) => !surveyQuestionIds.includes(id)
    );

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Some question IDs do not belong to this survey" },
        { status: 400 }
      );
    }

    // Update order for each question in a transaction
    await prisma.$transaction(
      questionIds.map((questionId: string, index: number) =>
        prisma.question.update({
          where: { id: questionId },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Questions reordered successfully",
    });
  } catch (error) {
    console.error("Reorder questions error:", error);
    return NextResponse.json(
      { error: "Failed to reorder questions" },
      { status: 500 }
    );
  }
}
