"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, RefreshCw, CheckCircle2, XCircle, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

type InvitationStatus = "pending" | "sent" | "failed" | "completed";

interface Invitation {
  id: string;
  email: string;
  status: InvitationStatus;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface InvitationStats {
  total: number;
  sent: number;
  completed: number;
  failed: number;
  pending: number;
  responseRate: number;
}

interface InvitationsListTabProps {
  surveyId: string;
  refreshTrigger?: number;
}

export function InvitationsListTab({ surveyId, refreshTrigger }: InvitationsListTabProps) {
  const t = useTranslations("Survey");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | "all">("all");

  useEffect(() => {
    fetchInvitations();
  }, [surveyId, statusFilter, refreshTrigger]);

  async function fetchInvitations() {
    try {
      setIsLoading(true);
      const url = statusFilter === "all"
        ? `/api/surveys/${surveyId}/invitations`
        : `/api/surveys/${surveyId}/invitations?status=${statusFilter}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch invitations");
      }

      const data = await response.json();
      setInvitations(data.invitations);
      setStats(data.stats);
    } catch (error) {
      console.error("Fetch invitations error:", error);
      toast.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend(email: string) {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: [email] }),
      });

      const result = await response.json();

      if (response.ok && result.success.count > 0) {
        toast.success("Invitation resent successfully");
        fetchInvitations();
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Resend invitation error:", error);
      toast.error("An error occurred while resending invitation");
    }
  }

  function getStatusBadge(status: InvitationStatus) {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" />
            {t("status_pending")}
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="default" className="flex items-center gap-1 w-fit bg-blue-500">
            <Send className="h-3 w-3" />
            {t("status_sent")}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            {t("status_completed")}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" />
            {t("status_failed")}
          </Badge>
        );
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm");
    } catch {
      return "-";
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("total_invitations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("sent")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("completed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("failed")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("response_rate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("invitations_list")}</CardTitle>
              <CardDescription>{t("invitations_list_description")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as InvitationStatus | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filter_by_status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_statuses")}</SelectItem>
                  <SelectItem value="pending">{t("status_pending")}</SelectItem>
                  <SelectItem value="sent">{t("status_sent")}</SelectItem>
                  <SelectItem value="completed">{t("status_completed")}</SelectItem>
                  <SelectItem value="failed">{t("status_failed")}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchInvitations()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("loading")}...
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? t("no_invitations_sent")
                  : t("no_invitations_with_status")}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("sent_at")}</TableHead>
                    <TableHead>{t("completed_at")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invitation.sentAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invitation.completedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invitation.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(invitation.email)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t("resend")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
