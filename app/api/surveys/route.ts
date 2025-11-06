import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTemplateById } from "@/lib/templates";
import { checkSurveyLimit, incrementSurveyUsage } from "@/lib/utils/subscription-limits";

export async function GET(request: NextRequest) {
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

    // Get query parameters for organization filtering
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const isPersonal = searchParams.get("personal") === "true";

    // Build where clause with visibility filtering
    let whereClause: any;

    if (isPersonal) {
      // Personal workspace: show personal surveys (no organization) created by user
      whereClause = {
        userId: session.user.id,
        organizationId: null,
      };
    } else if (organizationId) {
      // Organization workspace: show surveys based on visibility
      // First, verify user is a member of this organization
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: organizationId,
          userId: session.user.id,
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Not a member of this organization" },
          { status: 403 }
        );
      }

      // Show surveys where:
      // 1. User created the survey (any visibility)
      // 2. Organization survey with visibility='organization'
      whereClause = {
        organizationId: organizationId,
        OR: [
          { userId: session.user.id }, // User's own surveys
          { visibility: "organization" }, // Organization-wide surveys
        ],
      };
    } else {
      // No specific context: show all surveys user has access to
      whereClause = {
        userId: session.user.id,
      };
    }

    // Fetch surveys for the authenticated user
    const surveys = await prisma.survey.findMany({
      where: whereClause,
      select: {
        id: true,
        uniqueId: true,
        title: true,
        description: true,
        status: true,
        organizationId: true,
        visibility: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        _count: {
          select: {
            responses: true,
            questions: true,
          },
        },
        responses: {
          take: 1,
          orderBy: {
            submittedAt: "desc",
          },
          select: {
            submittedAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      surveys: surveys.map((survey:any) => ({
        id: survey.id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        userId: survey.userId,
        visibility: survey.visibility,
        organizationId: survey.organizationId,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        publishedAt: survey.publishedAt,
        responseCount: survey._count.responses,
        questionCount: survey._count.questions,
        lastResponseDate: survey.responses[0]?.submittedAt || null,
      })),
    });
  } catch (error) {
    console.error("Fetch surveys error:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, templateId, visibility, organizationId } = body;

    // Check survey limit BEFORE creating
    const limitCheck = await checkSurveyLimit(session.user.id);

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'survey_limit_reached',
          message: limitCheck.message,
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 }
      );
    }

    // Validate title
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Validate visibility
    const validVisibility = visibility && ["private", "organization"].includes(visibility)
      ? visibility
      : "organization";

    // Check if template exists if templateId is provided
    let template = null;
    if (templateId) {
      template = getTemplateById(templateId);
      if (!template) {
        return NextResponse.json(
          { error: "Invalid template ID" },
          { status: 400 }
        );
      }
    }

    // Create new survey with questions if using a template
    const survey = await prisma.survey.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        status: "draft",
        visibility: validVisibility,
        organizationId: organizationId || null,
        // Create questions from template if provided
        ...(template && {
          questions: {
            create: template.questions.map((question, index) => ({
              type: question.type,
              text: question.text,
              required: question.required,
              order: index,
              options: question.options,
            })),
          },
        }),
      },
      include: {
        questions: true,
      },
    });

    // Increment usage count
    await incrementSurveyUsage(session.user.id, organizationId);

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        questionCount: survey.questions.length,
      },
    });
  } catch (error) {
    console.error("Create survey error:", error);
    return NextResponse.json(
      { error: "Failed to create survey" },
      { status: 500 }
    );
  }
}
