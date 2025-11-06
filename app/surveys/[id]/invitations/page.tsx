"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { InviteParticipantsModal } from "@/components/surveys/InviteParticipantsModal";
import { InvitationsListTab } from "@/components/surveys/InvitationsListTab";

type Survey = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
};

export default function SurveyInvitationsPage() {
  const t = useTranslations("Survey");
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const { data: session, isPending } = useSession();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (session?.user && surveyId) {
      fetchSurvey();
    }
  }, [session, surveyId]);

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
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back_to_dashboard")}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/surveys/${surveyId}/responses`)}
              >
                {t("responses")}
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            {survey.description && (
              <p className="mt-2 text-gray-600">{survey.description}</p>
            )}
          </div>
          {survey.status === "published" && (
            <InviteParticipantsModal
              surveyId={surveyId}
              onInvitationsSent={handleInvitationsSent}
            />
          )}
        </div>

        {/* Invitations List */}
        <InvitationsListTab surveyId={surveyId} refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
