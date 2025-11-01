import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type QuestionAnalytics = {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  totalResponses: number;
  data: any;
};

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

    // Fetch survey to verify ownership
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        responses: {
          select: {
            answers: true,
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

    // Calculate analytics for each question
    const analytics: QuestionAnalytics[] = survey.questions.map((question) => {
      const questionType = question.type as QuestionType;
      const totalResponses = survey.responses.length;

      // Collect all answers for this question
      const answers = survey.responses
        .map((response) => {
          const responseAnswers = response.answers as any[];
          const answer = responseAnswers.find((a) => a.questionId === question.id);
          return answer?.answer;
        })
        .filter((answer) => answer !== null && answer !== undefined && answer !== "");

      let data: any = {};

      switch (questionType) {
        case "multiple_choice":
        case "dropdown":
        case "yes_no": {
          // Count occurrences of each option
          const counts: Record<string, number> = {};
          answers.forEach((answer) => {
            const value = String(answer);
            counts[value] = (counts[value] || 0) + 1;
          });

          // Convert to array format for charts
          data = {
            type: "categorical",
            options: Object.entries(counts).map(([option, count]) => ({
              option,
              count,
              percentage: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : "0",
            })),
          };
          break;
        }

        case "checkbox": {
          // Count occurrences of each selected option
          const counts: Record<string, number> = {};
          answers.forEach((answer) => {
            if (Array.isArray(answer)) {
              answer.forEach((option) => {
                counts[option] = (counts[option] || 0) + 1;
              });
            }
          });

          data = {
            type: "categorical",
            options: Object.entries(counts).map(([option, count]) => ({
              option,
              count,
              percentage: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : "0",
            })),
          };
          break;
        }

        case "rating_scale": {
          const options = question.options as any;
          const min = options.min || 1;
          const max = options.max || 5;

          // Count occurrences of each rating
          const counts: Record<number, number> = {};
          for (let i = min; i <= max; i++) {
            counts[i] = 0;
          }

          answers.forEach((answer) => {
            const rating = Number(answer);
            if (!isNaN(rating) && rating >= min && rating <= max) {
              counts[rating] = (counts[rating] || 0) + 1;
            }
          });

          data = {
            type: "rating",
            options: Object.entries(counts).map(([rating, count]) => ({
              option: rating,
              count,
              percentage: totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : "0",
            })),
            min,
            max,
          };
          break;
        }

        case "text_input": {
          // Return list of text responses (no chart)
          data = {
            type: "text",
            responses: answers.slice(0, 100), // Limit to first 100 for performance
            totalCount: answers.length,
          };
          break;
        }

        default:
          data = { type: "unknown" };
      }

      return {
        questionId: question.id,
        questionText: question.text,
        questionType,
        totalResponses: answers.length,
        data,
      };
    });

    return NextResponse.json({
      analytics,
      totalResponses: survey.responses.length,
    });
  } catch (error) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
