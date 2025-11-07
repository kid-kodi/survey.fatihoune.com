"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Mail, User, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";

type InvitationData = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationDescription: string | null;
  inviterName: string;
  roleName: string;
  inviteeEmail: string;
  createdAt: string;
  expiresAt: string;
};

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const t = useTranslations("Organization");
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

   const unwrappedParams = use(params);
  const token = unwrappedParams.token;

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  async function fetchInvitation() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/invitations/${token}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch invitation");
      }

      const data = await response.json();
      setInvitation(data.invitation);
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError(err instanceof Error ? err.message : "Failed to load invitation");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAccept() {
    if (!session) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invitations/${token}`);
      return;
    }

    setIsAccepting(true);

    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept invitation");
      }

      const data = await response.json();
      toast.success(
        t("invitation_accepted", {
          organizationName: data.organization.name,
        })
      );

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleDecline() {
    setIsDeclining(true);

    try {
      const response = await fetch(`/api/invitations/${token}/decline`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to decline invitation");
      }

      toast.success(t("invitation_declined"));

      // Redirect to home or dashboard
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Error declining invitation:", err);
      toast.error(err instanceof Error ? err.message : "Failed to decline invitation");
    } finally {
      setIsDeclining(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (isLoading || sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <Logo />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {error === "Invitation not found" ? t("invitation_expired") : "Error"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Logo  />

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">{t("invitation_details")}</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {invitation.organizationName}
                </p>
                {invitation.organizationDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    {invitation.organizationDescription}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Invited by</p>
                  <p className="text-sm font-medium">{invitation.inviterName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium">{invitation.roleName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Invited on</p>
                  <p className="text-sm font-medium">
                    {formatDate(invitation.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Expires on</p>
                  <p className="text-sm font-medium">
                    {formatDate(invitation.expiresAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notice */}
          {session && session.user.email !== invitation.inviteeEmail && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This invitation was sent to{" "}
                {invitation.inviteeEmail}, but you're logged in as{" "}
                {session.user.email}. You may not be able to accept this invitation.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
              className="flex-1"
              size="lg"
            >
              {isAccepting ? (
                "Accepting..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t("join_organization")}
                </>
              )}
            </Button>

            <Button
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {isDeclining ? (
                "Declining..."
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  {t("decline_invitation")}
                </>
              )}
            </Button>
          </div>

          {!session && (
            <p className="text-center text-sm text-gray-600">
              You need to{" "}
              <a
                href={`/login?redirect=/invitations/${token}`}
                className="text-primary hover:underline"
              >
                sign in
              </a>{" "}
              or{" "}
              <a
                href={`/register?redirect=/invitations/${token}`}
                className="text-primary hover:underline"
              >
                create an account
              </a>{" "}
              to accept this invitation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
