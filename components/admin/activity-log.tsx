"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";

type AdminAction = {
  id: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  targetResource: string;
  metadata: Record<string, unknown>;
  performedAt: string;
};

type ActionsResponse = {
  actions: AdminAction[];
  total: number;
  page: number;
  limit: number;
};

export function ActivityLog() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState<AdminAction | null>(null);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (actionFilter) params.append("action", actionFilter);

      const response = await fetch(`/api/admin/activity-log?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch activity log");
      }

      const data: ActionsResponse = await response.json();
      setActions(data.actions);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching activity log:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, actionFilter]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const formatActionName = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getActionColor = (action: string) => {
    if (action.includes("impersonate")) return "text-blue-600 bg-blue-50 border-blue-200";
    if (action.includes("extend") || action.includes("change"))
      return "text-purple-600 bg-purple-50 border-purple-200";
    if (action.includes("set_custom")) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Search by Resource</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g., user:123 or subscription:456"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <label className="text-sm font-medium mb-1.5 block">Action Type</label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              <SelectItem value="impersonate_user">Impersonate User</SelectItem>
              <SelectItem value="extend_subscription_period">Extend Subscription</SelectItem>
              <SelectItem value="change_subscription_plan">Change Plan</SelectItem>
              <SelectItem value="set_custom_limits">Set Custom Limits</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No activity found
                </TableCell>
              </TableRow>
            ) : (
              actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(action.performedAt), "MMM dd, yyyy")}</div>
                      <div className="text-muted-foreground">
                        {format(new Date(action.performedAt), "HH:mm:ss")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{action.admin.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.admin.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getActionColor(action.action)} border`}
                    >
                      {formatActionName(action.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {action.targetResource}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAction(action)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {total} actions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Metadata Dialog */}
      {selectedAction && (
        <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Action Details</DialogTitle>
              <DialogDescription>
                {format(new Date(selectedAction.performedAt), "MMMM dd, yyyy 'at' HH:mm:ss")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Admin</h3>
                <p className="text-sm">
                  {selectedAction.admin.name} ({selectedAction.admin.email})
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Action</h3>
                <p className="text-sm">{formatActionName(selectedAction.action)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Target Resource</h3>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {selectedAction.targetResource}
                </code>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Metadata</h3>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(selectedAction.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
