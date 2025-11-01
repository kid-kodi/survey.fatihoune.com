"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, TrendingUp } from "lucide-react";

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
};

export default function SurveyAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user && surveyId) {
      fetchSurveyAndMetrics();
    }
  }, [session, surveyId]);

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

        {/* Placeholder for future tabs (Story 4.2, 4.3) */}
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
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">
                Response details and analytics coming soon...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                (Story 4.2: Individual Responses & Story 4.3: Analytics Charts)
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
