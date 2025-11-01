"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText } from "lucide-react";

type QuestionType = "multiple_choice" | "text_input" | "rating_scale" | "checkbox" | "dropdown" | "yes_no";

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options: any;
  required: boolean;
  order: number;
  logic: any;
};

type Survey = {
  id: string;
  uniqueId: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  questions: Question[];
};

export default function PublicSurveyPage() {
  const params = useParams();
  const uniqueId = params.uniqueId as string;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (uniqueId) {
      fetchSurvey();
    }
  }, [uniqueId]);

  const fetchSurvey = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`/api/public/surveys/${uniqueId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Survey not found");
        } else {
          throw new Error("Failed to fetch survey");
        }
      } else {
        const data = await response.json();
        setSurvey(data.survey);
      }
    } catch (err) {
      setError("Failed to load survey. Please try again.");
      console.error("Fetch survey error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading survey...</p>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Survey Not Found
              </h2>
              <p className="text-gray-600">
                {error || "The survey you're looking for doesn't exist or is no longer available."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (survey.status === "archived") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Survey Closed
              </h2>
              <p className="text-gray-600">
                This survey is no longer accepting responses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Survey Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription className="text-base mt-2">
                {survey.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Survey Form - Will be implemented in Story 3.3 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {survey.questions.length === 0 ? (
                <p className="text-center text-gray-500">
                  This survey has no questions yet.
                </p>
              ) : (
                survey.questions.map((question, index) => (
                  <div key={question.id} className="pb-6 border-b last:border-b-0">
                    <div className="mb-3">
                      <label className="text-base font-medium text-gray-900">
                        <span className="text-gray-500 mr-2">Q{index + 1}.</span>
                        {question.text}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                    </div>

                    {/* Question rendering placeholder - will be implemented in Story 3.3 */}
                    <div className="text-sm text-gray-500 italic">
                      [{question.type.replace(/_/g, " ")} question]
                    </div>
                  </div>
                ))
              )}
            </div>

            {survey.questions.length > 0 && (
              <Alert className="mt-6">
                <AlertDescription className="text-sm text-gray-600">
                  Question rendering and response submission will be available in the next update.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
