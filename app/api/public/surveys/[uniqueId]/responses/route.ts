import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uniqueId: string }> }
) {
  try {
    const { uniqueId } = await params;

    // Parse request body
    const body = await request.json();
    const { answers } = body;

    // Validate request
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid request: answers array required" },
        { status: 400 }
      );
    }

    // Verify survey exists and is published
    const survey = await prisma.survey.findUnique({
      where: { uniqueId: uniqueId },
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

    if (survey.status !== "published") {
      return NextResponse.json(
        { error: "Survey is not available for responses" },
        { status: 403 }
      );
    }

    // Validate required questions are answered
    const requiredQuestions = survey.questions.filter((q) => q.required);
    const answeredQuestionIds = new Set(
      answers.filter((a) => a.answer !== null && a.answer !== "").map((a) => a.questionId)
    );

    const missingRequired = requiredQuestions.filter(
      (q) => !answeredQuestionIds.has(q.id)
    );

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: "Required questions not answered",
          missingQuestions: missingRequired.map((q) => q.text),
        },
        { status: 400 }
      );
    }

    // Extract IP address and user agent for tracking (optional)
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    // Store response in database
    const response = await prisma.response.create({
      data: {
        surveyId: survey.id,
        answers: answers,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      responseId: response.id,
      message: "Response submitted successfully",
    });
  } catch (error) {
    console.error("Submit response error:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
