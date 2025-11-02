import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Papa from "papaparse";

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

    const { id: surveyId } = await params;

    // Fetch survey to verify ownership and get questions
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        responses: {
          orderBy: {
            submittedAt: "desc",
          },
          select: {
            id: true,
            answers: true,
            submittedAt: true,
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

    // Prepare CSV data
    // Headers: Timestamp, Question 1, Question 2, ...
    const csvHeaders = [
      "Timestamp",
      ...survey.questions.map((q) => q.text),
    ];

    // Build rows
    const csvRows = survey.responses.map((response) => {
      const row: any = {
        Timestamp: new Date(response.submittedAt).toISOString(),
      };

      // For each question, find the answer
      survey.questions.forEach((question) => {
        const answers = response.answers as any[];
        const answer = answers.find((a) => a.questionId === question.id);

        if (!answer || answer.answer === null || answer.answer === undefined || answer.answer === "") {
          // No answer or conditional question not shown
          row[question.text] = "";
        } else if (Array.isArray(answer.answer)) {
          // Checkbox: comma-separated values
          row[question.text] = answer.answer.join(", ");
        } else if (typeof answer.answer === "boolean") {
          // Boolean: Yes/No
          row[question.text] = answer.answer ? "Yes" : "No";
        } else {
          // String or number
          row[question.text] = String(answer.answer);
        }
      });

      return row;
    });

    // Generate CSV using Papa Parse
    const csv = Papa.unparse({
      fields: csvHeaders,
      data: csvRows,
    });

    // Create filename
    const filename = `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-responses-${new Date().toISOString().split('T')[0]}.csv`;

    // Return CSV as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export responses error:", error);
    return NextResponse.json(
      { error: "Failed to export responses" },
      { status: 500 }
    );
  }
}
