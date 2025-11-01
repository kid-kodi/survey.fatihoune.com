"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, TrendingUp, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";

type Metrics = {
  totalResponses: number;
  completionRate: number | null;
  questionCount: number;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  questions: Array<{
    id: string;
    type: string;
    text: string;
    required: boolean;
    order: number;
  }>;
};

type Response = {
  id: string;
  answers: Array<{
    questionId: string;
    answer: any;
  }>;
  submittedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

export default function SurveyAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (session?.user && surveyId) {
      fetchSurveyAndMetrics();
    }
  }, [session, surveyId]);

  useEffect(() => {
    if (session?.user && surveyId && survey) {
      fetchResponses(currentPage);
    }
  }, [currentPage, survey]);

  const fetchSurveyAndMetrics = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Fetch survey details
      const surveyResponse = await fetch(`/api/surveys/${surveyId}`);
      if (!surveyResponse.ok) {
        throw new Error("Failed to fetch survey");
      }
      const surveyData = await surveyResponse.json();
      setSurvey(surveyData.survey);

      // Fetch metrics
      const metricsResponse = await fetch(`/api/surveys/${surveyId}/metrics`);
      if (!metricsResponse.ok) {
        throw new Error("Failed to fetch metrics");
      }
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.metrics);
    } catch (err) {
      setError("Failed to load survey data. Please try again.");
      console.error("Fetch survey/metrics error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponses = async (page: number) => {
    try {
      setIsLoadingResponses(true);
      const response = await fetch(
        `/api/surveys/${surveyId}/responses?page=${page}&limit=50`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }
      const data = await response.json();
      setResponses(data.responses);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Fetch responses error:", err);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const formatAnswerValue = (answer: any, questionType: string): string => {
    if (answer === null || answer === undefined || answer === "") {
      return "Not answered";
    }

    if (Array.isArray(answer)) {
      return answer.join(", ");
    }

    if (typeof answer === "boolean") {
      return answer ? "Yes" : "No";
    }

    return String(answer);
  };

  // Show loading state while checking session
  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If no session, redirect to login
  if (!session) {
    router.push("/login");
    return null;
  }

  if (error || !survey || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            {error || "Failed to load survey data"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Survey Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && (
            <p className="mt-2 text-gray-600">{survey.description}</p>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Total Responses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Responses
              </CardTitle>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {metrics.totalResponses}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.totalResponses === 1 ? "response" : "responses"} collected
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {metrics.completionRate !== null
                  ? `${Math.round(metrics.completionRate)}%`
                  : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.completionRate !== null
                  ? "Average questions answered"
                  : "No responses yet"}
              </p>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {metrics.questionCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.questionCount === 1 ? "question" : "questions"} in survey
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Responses and Analytics */}
        {metrics.totalResponses === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No responses yet
              </h3>
              <p className="text-gray-600 mb-4">
                Share your survey to start collecting data
              </p>
              {survey.status === "published" && (
                <Button
                  onClick={() => router.push(`/surveys/${surveyId}/edit`)}
                >
                  View Survey Link
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="responses" className="w-full">
            <TabsList>
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics (Coming Soon)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="responses" className="mt-6">
              {selectedResponse ? (
                /* Detailed Response View */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Response Details</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4" />
                          {format(new Date(selectedResponse.submittedAt), "PPpp")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedResponse(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to List
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {survey.questions.map((question, index) => {
                        const answer = selectedResponse.answers.find(
                          (a) => a.questionId === question.id
                        );
                        return (
                          <div key={question.id} className="pb-6 border-b last:border-b-0">
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Q{index + 1}.
                              </span>
                              <span className="ml-2 text-base font-medium text-gray-900">
                                {question.text}
                              </span>
                            </div>
                            <div className="ml-7 text-gray-700">
                              {formatAnswerValue(answer?.answer, question.type)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Response List */
                <>
                  <div className="space-y-4">
                    {isLoadingResponses ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <p className="text-gray-600">Loading responses...</p>
                        </CardContent>
                      </Card>
                    ) : (
                      responses.map((response, index) => (
                        <Card
                          key={response.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">
                                  Response #{pagination ? (pagination.page - 1) * pagination.limit + index + 1 : index + 1}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(response.submittedAt), "PPp")}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
                        {pagination.totalCount} responses
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                          }
                          disabled={pagination.page === pagination.totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">
                    Analytics charts coming in Story 4.3...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
