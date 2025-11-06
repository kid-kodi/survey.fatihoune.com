import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/services/email-service";
import { SurveyInvitationEmail } from "@/lib/email-templates/SurveyInvitationEmail";
import { generateInvitationToken } from "@/lib/utils/invitation";
import { z } from "zod";

const sendInvitationsSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(50),
});

// POST /api/surveys/[id]/invitations - Send bulk invitations
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate and authorize
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: surveyId } = await params;

    // 2. Verify survey ownership and status
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (survey.status !== "published") {
      return NextResponse.json(
        { error: "Cannot send invitations for draft surveys" },
        { status: 400 }
      );
    }

    // 3. Validate request body
    const body = await request.json();
    const validation = sendInvitationsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { emails } = validation.data;

    // 4. Process invitations
    const results = {
      success: { count: 0, emails: [] as string[] },
      failed: {
        count: 0,
        errors: [] as Array<{ email: string; reason: string }>,
      },
      stats: { totalInvitations: 0, emailsSent: 0, emailsFailed: 0 },
    };

    for (const email of emails) {
      try {
        // Check for duplicate
        const existing = await prisma.surveyInvitation.findUnique({
          where: {
            surveyId_email: {
              surveyId,
              email,
            },
          },
        });

        if (existing) {
          results.failed.count++;
          results.failed.errors.push({
            email,
            reason: "Already invited to this survey",
          });
          continue;
        }

        // Create invitation
        const token = generateInvitationToken();
        const invitation = await prisma.surveyInvitation.create({
          data: {
            surveyId,
            email,
            token,
            status: "pending",
          },
        });

        // Send email
        const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${survey.uniqueId}?invitation=${token}`;

        try {
          const emailResult = await sendEmail({
            to: email,
            subject: `${survey.user.name} invited you to complete a survey`,
            react: SurveyInvitationEmail({
              surveyTitle: survey.title,
              surveyDescription: survey.description || "",
              creatorName: survey.user.name || "Someone",
              invitationUrl,
              estimatedTime: "5 minutes",
              locale: "en", // TODO: Use creator's locale from user preferences
            }),
          });

          if (emailResult.success) {
            // Update status to sent
            await prisma.surveyInvitation.update({
              where: { id: invitation.id },
              data: { status: "sent", sentAt: new Date() },
            });

            results.success.count++;
            results.success.emails.push(email);
            results.stats.emailsSent++;
          } else {
            // Email failed
            await prisma.surveyInvitation.update({
              where: { id: invitation.id },
              data: { status: "failed" },
            });

            results.failed.count++;
            results.failed.errors.push({
              email,
              reason: emailResult.error || "Email delivery failed",
            });
            results.stats.emailsFailed++;
          }
        } catch (emailError) {
          // Email sending exception
          await prisma.surveyInvitation.update({
            where: { id: invitation.id },
            data: { status: "failed" },
          });

          results.failed.count++;
          results.failed.errors.push({
            email,
            reason:
              emailError instanceof Error
                ? emailError.message
                : "Email delivery failed",
          });
          results.stats.emailsFailed++;
        }

        results.stats.totalInvitations++;
      } catch (error) {
        results.failed.count++;
        results.failed.errors.push({
          email,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Send invitations error:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}

// GET /api/surveys/[id]/invitations - List invitations with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate and authorize
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: surveyId } = await params;

    // 2. Verify survey ownership
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3. Get filter parameters
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    // 4. Fetch invitations
    const whereClause: {
      surveyId: string;
      status?: "pending" | "sent" | "failed" | "completed";
    } = { surveyId };
    if (statusFilter && ["pending", "sent", "failed", "completed"].includes(statusFilter)) {
      whereClause.status = statusFilter as "pending" | "sent" | "failed" | "completed";
    }

    const invitations = await prisma.surveyInvitation.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        status: true,
        sentAt: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 5. Calculate statistics
    const stats = await prisma.surveyInvitation.groupBy({
      by: ["status"],
      where: { surveyId },
      _count: {
        status: true,
      },
    });

    const total = invitations.length;
    const sent = stats.find((s) => s.status === "sent")?._count.status || 0;
    const completed =
      stats.find((s) => s.status === "completed")?._count.status || 0;
    const failed = stats.find((s) => s.status === "failed")?._count.status || 0;
    const pending =
      stats.find((s) => s.status === "pending")?._count.status || 0;

    // Calculate response rate (completed / sent) * 100
    const responseRate = sent > 0 ? (completed / sent) * 100 : 0;

    return NextResponse.json({
      invitations,
      stats: {
        total,
        sent,
        completed,
        failed,
        pending,
        responseRate: parseFloat(responseRate.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Fetch invitations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
