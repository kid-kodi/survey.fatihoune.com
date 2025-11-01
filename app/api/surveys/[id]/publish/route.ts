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

    // Fetch the survey with questions
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

    // Check authorization
    if (survey.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Validate survey can be published
    const validationErrors: string[] = [];

    if (!survey.title || !survey.title.trim()) {
      validationErrors.push("Survey must have a title");
    }

    if (survey.questions.length === 0) {
      validationErrors.push("Survey must have at least one question");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Survey validation failed",
          validationErrors
        },
        { status: 400 }
      );
    }

    // Publish the survey
    const updatedSurvey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: updatedSurvey.id,
        uniqueId: updatedSurvey.uniqueId,
        title: updatedSurvey.title,
        description: updatedSurvey.description,
        status: updatedSurvey.status,
        publishedAt: updatedSurvey.publishedAt,
        publicUrl: `/s/${updatedSurvey.uniqueId}`,
      },
    });
  } catch (error) {
    console.error("Publish survey error:", error);
    return NextResponse.json(
      { error: "Failed to publish survey" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Fetch the survey
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
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

    // Unpublish the survey (set back to draft)
    const updatedSurvey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        status: "draft",
        // Note: We keep publishedAt to maintain history
      },
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: updatedSurvey.id,
        title: updatedSurvey.title,
        status: updatedSurvey.status,
      },
    });
  } catch (error) {
    console.error("Unpublish survey error:", error);
    return NextResponse.json(
      { error: "Failed to unpublish survey" },
      { status: 500 }
    );
  }
}
