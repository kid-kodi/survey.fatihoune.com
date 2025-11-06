import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  createdAt: Date;
  surveyId: string;
  type: QuestionType;
  text: string;
  options: any;
  required: boolean;
  order: number;
  logic: any | null;
}

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

    // Fetch the survey with all questions
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
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

    // Check authorization
    if (survey.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create duplicate survey with all questions
    const duplicatedSurvey = await prisma.survey.create({
      data: {
        userId: session.user.id,
        title: `${survey.title} - Copy`,
        description: survey.description,
        status: "draft",
        // Create questions from original survey
        questions: {
          create: survey.questions.map((question: Question, index:number) => ({
            type: question.type,
            text: question.text,
            options: question.options as any,
            required: question.required,
            order: index,
            logic: question.logic as any,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: duplicatedSurvey.id,
        uniqueId: duplicatedSurvey.uniqueId,
        title: duplicatedSurvey.title,
        description: duplicatedSurvey.description,
        status: duplicatedSurvey.status,
        questionCount: duplicatedSurvey.questions.length,
      },
    });
  } catch (error) {
    console.error("Duplicate survey error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate survey" },
      { status: 500 }
    );
  }
}
