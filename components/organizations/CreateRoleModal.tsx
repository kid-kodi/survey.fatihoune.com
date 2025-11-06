"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Shield } from "lucide-react";

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name must be less than 50 characters"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, "Select at least one permission"),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface CreateRoleModalProps {
  organizationId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateRoleModal({
  organizationId,
  trigger,
  onSuccess,
}: CreateRoleModalProps) {
  const t = useTranslations("Organization");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      fetchPermissions();
    }
  }, [open]);

  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await fetch("/api/permissions");
      if (!response.ok) throw new Error("Failed to fetch permissions");

      const data = await response.json();
      setPermissions(data.permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoadingPermissions(false);
    }
  };

  const onSubmit = async (values: RoleFormValues) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/organizations/${organizationId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create role");
      }

      toast.success("Role created successfully!");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast.error(error.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const key = `category_${category}` as any;
    return t(key);
  };

  const getPermissionLabel = (permission: Permission) => {
    const nameKey = `permission_${permission.name}` as any;
    return t(nameKey);
  };

  const getPermissionDescription = (permission: Permission) => {
    const descKey = `permission_${permission.name}_desc` as any;
    return t(descKey);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("create_role")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("create_role")}</DialogTitle>
          <DialogDescription>
            Create a custom role with specific permissions for your organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Role Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("role_name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Content Editor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this role can do..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permissions */}
                <FormField
                  control={form.control}
                  name="permissionIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Permissions</FormLabel>
                        <FormDescription>
                          Select the permissions for this role
                        </FormDescription>
                      </div>

                      {loadingPermissions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(permissions).map(([category, perms]) => (
                            <div key={category} className="space-y-3">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {getCategoryLabel(category)}
                              </h4>
                              <div className="space-y-3 pl-6">
                                {perms.map((permission) => (
                                  <FormField
                                    key={permission.id}
                                    control={form.control}
                                    name="permissionIds"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={permission.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(permission.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, permission.id])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== permission.id
                                                      )
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="font-normal cursor-pointer">
                                              {getPermissionLabel(permission)}
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                              {getPermissionDescription(permission)}
                                            </p>
                                          </div>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || loadingPermissions}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("create_role")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
