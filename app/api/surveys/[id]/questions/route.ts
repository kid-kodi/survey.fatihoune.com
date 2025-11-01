import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(
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
    const { type, text, options, required } = body;

    // Validate survey exists and belongs to user
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { order: "desc" },
          take: 1,
        },
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

    // Validate required fields
    if (!type || !text || !text.trim()) {
      return NextResponse.json(
        { error: "Question type and text are required" },
        { status: 400 }
      );
    }

    // Calculate order (append to end)
    const order = survey.questions.length > 0
      ? survey.questions[0].order + 1
      : 0;

    // Create question
    const question = await prisma.question.create({
      data: {
        surveyId,
        type,
        text: text.trim(),
        options: options || {},
        required: required || false,
        order,
      },
    });

    return NextResponse.json({
      success: true,
      question: {
        id: question.id,
        surveyId: question.surveyId,
        type: question.type,
        text: question.text,
        options: question.options,
        required: question.required,
        order: question.order,
      },
    });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
