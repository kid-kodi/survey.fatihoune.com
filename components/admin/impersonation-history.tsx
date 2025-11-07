"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
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
import { Loader2, StopCircle } from "lucide-react";
import { ImpersonationHistoryResponse } from "@/types/admin";

export function ImpersonationHistory() {
  const [data, setData] = useState<ImpersonationHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [filter, page]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/impersonation-history?filter=${filter}&page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (startedAt: string | Date, endedAt: string | Date | null) => {
    if (!endedAt) return "Active";

    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const handleEndSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to end this impersonation session?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/stop-impersonation", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to stop impersonation");
      }

      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Failed to end session");
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="completed">Completed Only</SelectItem>
          </SelectContent>
        </Select>

        {data && (
          <p className="text-sm text-muted-foreground">
            Showing {data.sessions.length} of {data.total} sessions
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data && data.sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Target User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.admin.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.admin.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.targetUser.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.targetUser.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {session.reason || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(session.startedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {calculateDuration(session.startedAt, session.endedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.endedAt ? (
                      <Badge variant="secondary">Completed</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!session.endedAt && (
                      <Button
                        onClick={() => handleEndSession(session.id)}
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <StopCircle className="h-4 w-4" />
                        End
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No impersonation sessions found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
