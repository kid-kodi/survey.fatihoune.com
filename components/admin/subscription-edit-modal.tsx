"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, addMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

type Plan = {
  id: string;
  name: string;
};

const formSchema = z.object({
  extendPeriod: z.string().optional(),
  extendUnit: z.enum(["days", "months"]).optional(),
  newPlanId: z.string().optional(),
  maxSurveys: z.string().optional(),
  maxOrganizations: z.string().optional(),
  maxMembersPerOrg: z.string().optional(),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionEditModalProps {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubscriptionEditModal({
  subscription,
  open,
  onClose,
  onSuccess,
}: SubscriptionEditModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      extendPeriod: "",
      extendUnit: "days",
      newPlanId: "",
      maxSurveys: "",
      maxOrganizations: "",
      maxMembersPerOrg: "",
      reason: "",
    },
  });

  // Fetch available plans
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/subscription-plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans || []);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    }
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const calculateNewEndDate = (values: FormValues): Date | null => {
    if (!subscription.currentPeriodEnd || !values.extendPeriod) return null;

    const days = parseInt(values.extendPeriod);
    if (isNaN(days) || days <= 0) return null;

    const currentEnd = new Date(subscription.currentPeriodEnd);
    const unit = values.extendUnit || "days";

    if (unit === "months") {
      return addMonths(currentEnd, days);
    } else {
      return addDays(currentEnd, days);
    }
  };

  const getChangeSummary = (values: FormValues) => {
    const changes: string[] = [];

    if (values.extendPeriod) {
      const newEndDate = calculateNewEndDate(values);
      if (newEndDate) {
        const unit = (values.extendUnit || "days") === "months" ? "months" : "days";
        changes.push(
          `Period will be extended by ${values.extendPeriod} ${unit} (new end date: ${format(
            newEndDate,
            "MMM dd, yyyy"
          )})`
        );
      }
    }

    if (values.newPlanId && values.newPlanId !== subscription.plan.id) {
      const newPlan = plans.find((p) => p.id === values.newPlanId);
      if (newPlan) {
        changes.push(`Plan will change from ${subscription.plan.name} to ${newPlan.name}`);
      }
    }

    const limitChanges: string[] = [];
    if (values.maxSurveys) {
      limitChanges.push(
        `Max surveys: ${values.maxSurveys === "unlimited" ? "Unlimited" : values.maxSurveys}`
      );
    }
    if (values.maxOrganizations) {
      limitChanges.push(
        `Max organizations: ${
          values.maxOrganizations === "unlimited" ? "Unlimited" : values.maxOrganizations
        }`
      );
    }
    if (values.maxMembersPerOrg) {
      limitChanges.push(
        `Max members per org: ${
          values.maxMembersPerOrg === "unlimited" ? "Unlimited" : values.maxMembersPerOrg
        }`
      );
    }

    if (limitChanges.length > 0) {
      changes.push(`Custom limits: ${limitChanges.join(", ")}`);
    }

    return changes;
  };

  const onSubmit = (values: FormValues) => {
    const changes = getChangeSummary(values);
    if (changes.length === 0) {
      toast.error("No changes to apply");
      return;
    }

    setPendingValues(values);
    setShowConfirmation(true);
  };

  const confirmChanges = async () => {
    if (!pendingValues) return;

    setLoading(true);
    try {
      const payload: {
        extendPeriodDays?: number;
        newPlanId?: string;
        customLimits?: Record<string, string | number>;
        reason?: string;
      } = {};

      // Extend period
      if (pendingValues.extendPeriod) {
        const days = parseInt(pendingValues.extendPeriod);
        if (!isNaN(days) && days > 0) {
          if ((pendingValues.extendUnit || "days") === "months") {
            payload.extendPeriodDays = days * 30; // Approximate months to days
          } else {
            payload.extendPeriodDays = days;
          }
        }
      }

      // Change plan
      if (pendingValues.newPlanId && pendingValues.newPlanId !== subscription.plan.id) {
        payload.newPlanId = pendingValues.newPlanId;
      }

      // Custom limits
      const customLimits: Record<string, string | number> = {};
      if (pendingValues.maxSurveys) {
        customLimits.maxSurveys =
          pendingValues.maxSurveys === "unlimited"
            ? "unlimited"
            : parseInt(pendingValues.maxSurveys);
      }
      if (pendingValues.maxOrganizations) {
        customLimits.maxOrganizations =
          pendingValues.maxOrganizations === "unlimited"
            ? "unlimited"
            : parseInt(pendingValues.maxOrganizations);
      }
      if (pendingValues.maxMembersPerOrg) {
        customLimits.maxMembersPerOrg =
          pendingValues.maxMembersPerOrg === "unlimited"
            ? "unlimited"
            : parseInt(pendingValues.maxMembersPerOrg);
      }

      if (Object.keys(customLimits).length > 0) {
        payload.customLimits = customLimits;
      }

      // Reason
      if (pendingValues.reason) {
        payload.reason = pendingValues.reason;
      }

      const response = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update subscription");
      }

      const data = await response.json();

      toast.success("Subscription updated successfully", {
        description: `Changes applied to ${subscription.user.name}'s account`,
      });

      setShowConfirmation(false);
      setPendingValues(null);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingValues(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Modify subscription details for {subscription.user.name}
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Details */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-medium mb-2">Current Subscription</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">User:</span>
                    <span className="ml-2 font-medium">{subscription.user.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="ml-2 font-medium">{subscription.plan.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium capitalize">
                      {subscription.status.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="ml-2 font-medium capitalize">
                      {subscription.paymentProvider.replace("_", " ")}
                    </span>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Period End:</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Extend Period */}
              <div className="space-y-4">
                <h3 className="font-medium">Extend Period</h3>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="extendPeriod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="extendUnit"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Change Plan */}
              <FormField
                control={form.control}
                name="newPlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Plan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new plan (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No change</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Custom Limits */}
              <div className="space-y-4">
                <h3 className="font-medium">Custom Limit Overrides</h3>
                <p className="text-sm text-muted-foreground">
                  Leave empty to use plan defaults. Enter a number or "unlimited"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="maxSurveys"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Surveys</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100 or unlimited" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxOrganizations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Organizations</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 or unlimited" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxMembersPerOrg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Members Per Org</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10 or unlimited" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Document why these changes are being made..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Review Changes</Button>
              </div>
            </form>
          </Form>
        ) : (
          // Confirmation Step
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are about to modify <strong>{subscription.user.name}</strong>'s
                subscription. Please review the changes below.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="font-medium">Summary of Changes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {getChangeSummary(pendingValues!).map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>

            {pendingValues?.reason && (
              <div>
                <h3 className="font-medium text-sm mb-1">Reason:</h3>
                <p className="text-sm text-muted-foreground">{pendingValues.reason}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelConfirmation}
                disabled={loading}
              >
                Go Back
              </Button>
              <Button onClick={confirmChanges} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
