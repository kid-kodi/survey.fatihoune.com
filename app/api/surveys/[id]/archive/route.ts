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

    // Archive the survey
    const updatedSurvey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        status: "archived",
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
    console.error("Archive survey error:", error);
    return NextResponse.json(
      { error: "Failed to archive survey" },
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

    // Unarchive the survey (restore to previous state, default to draft)
    const updatedSurvey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        // If it was published before archiving, restore to published, otherwise draft
        status: survey.publishedAt ? "published" : "draft",
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
    console.error("Unarchive survey error:", error);
    return NextResponse.json(
      { error: "Failed to unarchive survey" },
      { status: 500 }
    );
  }
}
