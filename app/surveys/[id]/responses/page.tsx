"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, ChevronLeft, ChevronRight, Clock, Download, LayoutGrid, TableIcon, Search, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

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

export default function SurveyResponsesPage() {
  const t = useTranslations('Analytics');
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    if (session?.user && surveyId) {
      fetchSurvey();
    }
  }, [session, surveyId]);

  useEffect(() => {
    if (session?.user && surveyId && survey) {
      fetchResponses(currentPage);
    }
  }, [currentPage, survey]);

  const fetchSurvey = async () => {
    try {
      setIsLoading(true);
      setError("");

      const surveyResponse = await fetch(`/api/surveys/${surveyId}`);
      if (!surveyResponse.ok) {
        throw new Error("Failed to fetch survey");
      }
      const surveyData = await surveyResponse.json();
      setSurvey(surveyData.survey);
    } catch (err) {
      setError(`${t("failed_load_survey")}`);
      console.error("Fetch survey error:", err);
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
      return `${t("not_answered")}`;
    }

    if (Array.isArray(answer)) {
      return answer.join(", ");
    }

    if (typeof answer === "boolean") {
      return answer ? `${t("yes")}` : `${t("no")}`;
    }

    return String(answer);
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/export`);
      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export CSV error:", err);
      setError(`${t("failed_export_csv")}`);
    }
  };

  const getFilteredAndSortedResponses = () => {
    let filtered = [...responses];

    if (searchFilter.trim() !== "" && survey) {
      filtered = filtered.filter((response) => {
        const searchLower = searchFilter.toLowerCase();
        return response.answers.some((answer) => {
          const answerValue = formatAnswerValue(answer.answer, "");
          return answerValue.toLowerCase().includes(searchLower);
        });
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (error || !survey) {
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
                {t("back_to_dashboard")}
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

  const totalResponses = pagination?.totalCount || 0;

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
                {t("back_to_dashboard")}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/surveys/${surveyId}/invitations`)}
              >
                {t("invitations")}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/surveys/${surveyId}/analytics`)}
              >
                {t("analytics")}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/surveys/${surveyId}/edit`)}
              >
                {t("edit")}
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
          <div className="mt-4 flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span className="text-lg font-medium">
              {totalResponses} {totalResponses === 1 ? `${t("response")}` : `${t("responses")}`}
            </span>
          </div>
        </div>

        {totalResponses === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t("no_responses_yet")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("share_survey")}
              </p>
              {survey.status === "published" && (
                <Button
                  onClick={() => router.push(`/surveys/${surveyId}/edit`)}
                >
                  {t("view_survey_link")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Export Button */}
            <div className="flex justify-end mb-4">
              <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t("export_to_csv")}
              </Button>
            </div>

            {selectedResponse ? (
              /* Detailed Response View */
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("response_details")}</CardTitle>
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
                      {t("back_to_list")}
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
                {/* View Mode Toggle and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* View Toggle */}
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                    <Button
                      variant={viewMode === "card" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("card")}
                      className="gap-2"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      {t("card_view")}
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="gap-2"
                    >
                      <TableIcon className="h-4 w-4" />
                      {t("table_view")}
                    </Button>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`${t("search_responses")}`}
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sort Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOrder === "desc" ? `${t("newest_first")}` : `${t("oldest_first")}`}
                  </Button>
                </div>

                {isLoadingResponses ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600">{t("loading_responses")}</p>
                    </CardContent>
                  </Card>
                ) : viewMode === "card" ? (
                  /* Card View */
                  <>
                    <div className="space-y-4">
                      {getFilteredAndSortedResponses().length === 0 ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <p className="text-gray-600">
                              {searchFilter ? "No responses match your search." : "No responses yet."}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        getFilteredAndSortedResponses().map((response, index) => (
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
                    {pagination && pagination.totalPages > 1 && !searchFilter && (
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
                ) : (
                  /* Table View */
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          {survey.questions.map((question) => (
                            <TableHead key={question.id} className="min-w-[150px]">
                              {question.text.length > 30
                                ? `${question.text.substring(0, 30)}...`
                                : question.text}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredAndSortedResponses().length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={survey.questions.length + 1}
                              className="text-center py-12 text-gray-600"
                            >
                              {searchFilter ? `${t("no_responses_match")}` : `${t("no_responses_yet")}`}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getFilteredAndSortedResponses().map((response) => (
                            <TableRow
                              key={response.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setSelectedResponse(response)}
                            >
                              <TableCell className="font-medium">
                                {format(new Date(response.submittedAt), "MMM d, yyyy HH:mm")}
                              </TableCell>
                              {survey.questions.map((question) => {
                                const answer = response.answers.find(
                                  (a) => a.questionId === question.id
                                );
                                const value = formatAnswerValue(answer?.answer, question.type);
                                return (
                                  <TableCell key={question.id}>
                                    {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
