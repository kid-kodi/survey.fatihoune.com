"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionEditModal } from "./subscription-edit-modal";
import { format } from "date-fns";
import { Search, X } from "lucide-react";

type Subscription = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  status: string;
  paymentProvider: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

type SubscriptionsResponse = {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
};

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");

  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (planFilter) params.append("plan", planFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (providerFilter) params.append("provider", providerFilter);

      const response = await fetch(`/api/admin/subscriptions?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data: SubscriptionsResponse = await response.json();
      setSubscriptions(data.subscriptions);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, planFilter, statusFilter, providerFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const clearFilters = () => {
    setSearch("");
    setPlanFilter("");
    setStatusFilter("");
    setProviderFilter("");
    setPage(1);
  };

  const hasFilters = search || planFilter || statusFilter || providerFilter;

  const getPlanBadgeVariant = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("free")) return "secondary";
    if (name.includes("pro")) return "default";
    if (name.includes("premium")) return "default";
    if (name.includes("custom")) return "default";
    return "secondary";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "cancelled":
        return "destructive";
      case "past_due":
        return "secondary";
      case "trialing":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "past_due":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "trialing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "";
    }
  };

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("free")) return "text-gray-600 bg-gray-50 border-gray-200";
    if (name.includes("pro")) return "text-blue-600 bg-blue-50 border-blue-200";
    if (name.includes("premium")) return "text-purple-600 bg-purple-50 border-purple-200";
    if (name.includes("custom")) return "text-amber-600 bg-amber-50 border-amber-200";
    return "";
  };

  const formatProvider = (provider: string) => {
    switch (provider) {
      case "stripe":
        return "Stripe";
      case "wave":
        return "Wave";
      case "orange_money":
        return "Orange Money";
      default:
        return provider;
    }
  };

  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1.5 block">Plan</label>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All plans</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1.5 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-1.5 block">Provider</label>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All providers</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="orange_money">Orange Money</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {subscription.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getPlanColor(subscription.plan.name)} border`}
                    >
                      {subscription.plan.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(subscription.status)} border capitalize`}
                    >
                      {subscription.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatProvider(subscription.paymentProvider)}</TableCell>
                  <TableCell>
                    {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                      <div className="text-sm">
                        <div>{format(new Date(subscription.currentPeriodStart), "MMM dd, yyyy")}</div>
                        <div className="text-muted-foreground">
                          to {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSubscription(subscription)}
                    >
                      Edit
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
            Showing {startItem}-{endItem} of {total} subscriptions
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

      {/* Edit Modal */}
      {editingSubscription && (
        <SubscriptionEditModal
          subscription={editingSubscription}
          open={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSuccess={() => {
            setEditingSubscription(null);
            fetchSubscriptions();
          }}
        />
      )}
    </div>
  );
}
