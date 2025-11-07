"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { InviteParticipantsModal } from "@/components/surveys/InviteParticipantsModal";
import { InvitationsListTab } from "@/components/surveys/InvitationsListTab";
import { SurveyTabs } from "../_components/survey-tabs";

type Survey = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
};


type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

export default function SurveyInvitationsPage() {
  const t = useTranslations("Survey");
  // const tAnalytics = useTranslations('Analytics');
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

   const [currentPage, setCurrentPage] = useState(1);

  const [responses, setResponses] = useState<Response[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

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
      setError("Failed to load survey");
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

  const handleInvitationsSent = () => {
    // Trigger refresh of invitations list
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">{t("loading")}...</div>
        </div>
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
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Survey Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
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

          <div className="flex items-center gap-2">
            {survey.status !== "draft" && (
              <Button
                variant="outline"
                onClick={() => router.push(`/surveys/${surveyId}/edit`)}
              >
                {t("edit")}
              </Button>
            )}

            {survey.status === "published" && (
              <InviteParticipantsModal
                surveyId={surveyId}
                onInvitationsSent={handleInvitationsSent}
              />
            )}
          </div>
        </div>

        <SurveyTabs surveyId={surveyId} t={t} />

        {/* Invitations List */}
        <InvitationsListTab surveyId={surveyId} refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
