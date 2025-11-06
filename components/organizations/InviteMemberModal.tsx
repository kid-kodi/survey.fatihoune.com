"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Please select a role"),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface InviteMemberModalProps {
  organizationId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  organizationId,
  trigger,
  onSuccess,
}: InviteMemberModalProps) {
  const t = useTranslations("Organization");
  const tSub = useTranslations("Subscription");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [usage, setUsage] = useState<{
    current: number;
    limit: number | 'unlimited';
  } | null>(null);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  // Fetch roles and usage for the organization
  useEffect(() => {
    if (open) {
      fetchRoles();
      fetchUsage();
    }
  }, [open, organizationId]);

  async function fetchRoles() {
    try {
      setLoadingRoles(true);
      const response = await fetch(`/api/organizations/${organizationId}/roles`);

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  }

  async function fetchUsage() {
    try {
      const response = await fetch(`/api/usage/members?organizationId=${organizationId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch member usage");
      }

      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error("Error fetching member usage:", error);
    }
  }

  async function onSubmit(data: InviteMemberFormData) {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitation");
      }

      const result = await response.json();

      toast.success(t("invitation_sent"));

      // Log invitation URL for development
      if (result.invitation?.invitationUrl) {
        console.log("📧 Invitation URL:", result.invitation.invitationUrl);
        console.log("Copy this URL to test the invitation flow");
      }

      // Reset form and close modal
      form.reset();
      setOpen(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Refresh the page to show new invitation
      router.refresh();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            {t("invite_member")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("invite_member")}</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. They will receive an
            email with a link to accept.
          </DialogDescription>
          {usage && usage.limit !== 'unlimited' && (
            <p className="text-sm text-gray-600 mt-2">
              {tSub('members_used', {
                current: usage.current,
                limit: usage.limit,
              })}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the person you want to invite
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || loadingRoles}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the role for this member
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || loadingRoles}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
