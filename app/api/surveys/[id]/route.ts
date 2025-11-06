import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { canAccessSurvey } from "@/lib/utils/visibility";
import { decrementSurveyUsage } from "@/lib/utils/subscription-limits";

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

    // Get user's organization memberships for access control
    const userOrgMemberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });
    const orgIds = userOrgMemberships.map((m) => m.organizationId);

    // Check if user can access this survey based on visibility rules
    if (!canAccessSurvey(survey, session.user.id, orgIds)) {
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
        visibility: survey.visibility,
        organizationId: survey.organizationId,
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

    const { id } = await params;
    const body = await request.json();
    const { title, description, visibility, status } = body;

    // Fetch the survey to verify ownership
    const survey = await prisma.survey.findUnique({
      where: { id },
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

    // Build update data object
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // Validate and update visibility
    if (visibility !== undefined) {
      if (!["private", "organization"].includes(visibility)) {
        return NextResponse.json(
          { error: "Invalid visibility value" },
          { status: 400 }
        );
      }
      updateData.visibility = visibility;
    }

    // Update the survey
    const updatedSurvey = await prisma.survey.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: updatedSurvey.id,
        visibility: updatedSurvey.visibility,
        title: updatedSurvey.title,
        description: updatedSurvey.description,
        status: updatedSurvey.status,
      },
    });
  } catch (error) {
    console.error("Update survey error:", error);
    return NextResponse.json(
      { error: "Failed to update survey" },
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

    const { id } = await params;

    // Fetch the survey to verify ownership
    const survey = await prisma.survey.findUnique({
      where: { id },
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

    // Delete the survey
    await prisma.survey.delete({
      where: { id },
    });

    // Decrement usage count
    await decrementSurveyUsage(session.user.id, survey.organizationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete survey error:", error);
    return NextResponse.json(
      { error: "Failed to delete survey" },
      { status: 500 }
    );
  }
}
