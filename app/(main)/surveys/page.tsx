"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Share2, BarChart3, FileText, CheckCircle2 } from "lucide-react";
import { ShareDialog } from "@/components/ShareDialog";

import { useTranslations } from "next-intl";
import { useOrganization } from "@/contexts/OrganizationContext";
import { PaymentWarningBanner } from "@/components/subscription/PaymentWarningBanner";
import { GracePeriodNotice } from "@/components/subscription/GracePeriodNotice";

type Survey = {
  id: string;
  uniqueId: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  responseCount: number;
  questionCount: number;
  lastResponseDate: string | null;
};

type DashboardStats = {
  totalSurveys: number;
  surveysPublished: number;
  totalResponses: number;
  lastResponseDate: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { currentOrganization, isPersonalWorkspace, refreshOrganizations } = useOrganization();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const t = useTranslations('SurveysList');

  // Fetch surveys and stats when component mounts or organization changes
  useEffect(() => {
    if (session?.user) {
      fetchSurveys();
      fetchDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentOrganization, isPersonalWorkspace]);

  const fetchSurveys = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Build query params based on organization context
      const params = new URLSearchParams();
      if (!isPersonalWorkspace && currentOrganization) {
        params.set("organizationId", currentOrganization.id);
      } else {
        params.set("personal", "true");
      }

      const response = await fetch(`/api/surveys?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch surveys");
      }

      const data = await response.json();
      setSurveys(data.surveys);
    } catch (err) {
      setError(`${t("failed_load_surveys")}`);
      console.error("Fetch surveys error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Fetch dashboard stats error:", err);
    }
  };


  const getStatusBadge = (status: Survey["status"]) => {
    const variants = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    } as const;

    const colors = {
      draft: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      published: "bg-green-100 text-green-800 hover:bg-green-100",
      archived: "bg-gray-50 text-gray-500 hover:bg-gray-50",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCardClick = (survey: Survey) => {
    if (survey.status === "draft") {
      router.push(`/surveys/${survey.id}/edit`);
    } else {
      router.push(`/surveys/${survey.id}/analytics`);
    }
  };

  const handleEdit = (surveyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/surveys/${surveyId}/edit`);
  };

  const handleDuplicate = async (surveyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/surveys/${surveyId}/duplicate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `${t("failed_duplicate")}`);
      } else {
        // Refresh surveys to show the new duplicate
        fetchSurveys();
        // Navigate to the new survey editor
        router.push(`/surveys/${data.survey.id}/edit`);
      }
    } catch (error) {
      console.error("Duplicate survey error:", error);
      alert("An unexpected error occurred while duplicating the survey");
    }
  };

  const handleArchive = async (surveyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`${t("archive_confirmation")}`)) {
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}/archive`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `${t("failed_archive")}`);
      } else {
        // Refresh surveys to remove the archived survey from the list
        fetchSurveys();
      }
    } catch (error) {
      console.error("Archive survey error:", error);
      alert(`${t("unexpected_error")}`);
    }
  };

  const handleUnarchive = async (surveyId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await fetch(`/api/surveys/${surveyId}/archive`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `${t("failed_unarchive")}`);
      } else {
        // Refresh surveys
        fetchSurveys();
      }
    } catch (error) {
      console.error("Unarchive survey error:", error);
      alert("An unexpected error occurred while unarchiving the survey");
    }
  };

  const handleViewResponses = (surveyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/surveys/${surveyId}/responses`);
  };

  const handleShare = (survey: Survey, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSurvey(survey);
    setShareDialogOpen(true);
  };

  // Show loading state while checking session
  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  // If no session, redirect to login (middleware should handle this, but just in case)
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PaymentWarningBanner />
        <GracePeriodNotice />

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {t("title")}
            </h2>
            <p className="mt-2 text-gray-600">
              {t("description")}
            </p>
          </div>
        </div>

        {/* Usage Widgets */}
        {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <SurveyUsageWidget />
          <OrganizationUsageWidget />
          <MemberUsageWidget />
        </div> */}

        {/* Overview Stats */}
        {stats && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Total Surveys */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("total_surveys")}
                </CardTitle>
                <FileText className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.totalSurveys}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t("all_surveys")}
                </p>
              </CardContent>
            </Card>

            {/* Total Responses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("total_responses")}
                </CardTitle>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.totalResponses}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t("across_all_surveys")}
                </p>
              </CardContent>
            </Card>

            {/* Surveys Published */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("published_surveys")}
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900">
                  {stats.surveysPublished}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t("active_collecting")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowArchived(false)}
              className={`${!showArchived
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              {t("active_surveys", { count: surveys.filter((s) => s.status !== "archived").length })}
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`${showArchived
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              {t("archived", { count: surveys.filter((s) => s.status === "archived").length })}
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* Empty State */}
        {surveys.filter((s) => showArchived ? s.status === "archived" : s.status !== "archived").length === 0 && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {showArchived ? `${t("active_collecting")}` : `${t("no_surveys_yet")}`}
              </h3>
              <p className="mb-4 text-gray-600">
                {showArchived
                  ? `${t("archived_will_appear")}`
                  : `${t("create_first_survey")}`}
              </p>
              {!showArchived && (
                <Button onClick={() => router.push("/surveys/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("create_new_survey")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Survey List */}
        {surveys.filter((s) => showArchived ? s.status === "archived" : s.status !== "archived").length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {surveys
              .filter((s) => showArchived ? s.status === "archived" : s.status !== "archived")
              .map((survey) => (
                <Card
                  key={survey.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => handleCardClick(survey)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <CardTitle className="truncate text-lg">
                          {survey.title}
                        </CardTitle>
                        <div className="mt-2">{getStatusBadge(survey.status)}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {survey.status !== "archived" && (
                            <>
                              <DropdownMenuItem onClick={(e) => handleEdit(survey.id, e)}>
                                {t("edit")}
                              </DropdownMenuItem>
                              {survey.status === "published" && (
                                <DropdownMenuItem onClick={(e) => handleShare(survey, e)}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  {t("share")}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => handleViewResponses(survey.id, e)}>
                                {t("view_responses")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDuplicate(survey.id, e)}>
                                {t("duplicate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleArchive(survey.id, e)}>
                                {t("archive")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {survey.status === "archived" && (
                            <>
                              <DropdownMenuItem onClick={(e) => handleViewResponses(survey.id, e)}>
                                {t("view_responses")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDuplicate(survey.id, e)}>
                                {t("duplicate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleUnarchive(survey.id, e)}>
                                {t("unarchive")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {survey.description && (
                      <CardDescription className="mb-4 line-clamp-2">
                        {survey.description}
                      </CardDescription>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>{t("questions")}</span>
                        <span className="font-medium">{survey.questionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("responses")}</span>
                        <span className="font-medium">{survey.responseCount}</span>
                      </div>
                      {survey.lastResponseDate ? (
                        <div className="flex justify-between">
                          <span>{t("last_response")}</span>
                          <span className="font-medium">
                            {formatDate(survey.lastResponseDate)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span>{t("updated")}</span>
                          <span className="font-medium">
                            {formatDate(survey.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>

      {/* Share Dialog */}
      {selectedSurvey && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          surveyTitle={selectedSurvey.title}
          uniqueId={selectedSurvey.uniqueId}
        />
      )}
    </div>
  );
}
