import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTemplateById } from "@/lib/templates";

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

    // Fetch all surveys for the authenticated user
    const surveys = await prisma.survey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        uniqueId: true,
        title: true,
        description: true,
        status: true,
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
      surveys: surveys.map((survey) => ({
        id: survey.id,
        uniqueId: survey.uniqueId,
        title: survey.title,
        description: survey.description,
        status: survey.status,
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
    const { title, description, templateId } = body;

    // Validate title
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

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
