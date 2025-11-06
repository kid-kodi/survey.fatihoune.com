"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Edit2, Trash2, Shield } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissionCount: number;
  memberCount: number;
}

interface ManageRolesProps {
  organizationId: string;
  canManageRoles: boolean;
  onEditRole?: (role: Role) => void;
  onRefresh?: () => void;
}

export function ManageRoles({
  organizationId,
  canManageRoles,
  onEditRole,
  onRefresh,
}: ManageRolesProps) {
  const t = useTranslations("Organization");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, [organizationId]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/roles`);
      if (!response.ok) throw new Error("Failed to fetch roles");

      const data = await response.json();
      setRoles(data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/roles/${roleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete role");
      }

      toast.success("Role deleted successfully");
      await fetchRoles();
      onRefresh?.();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(error.message || "Failed to delete role");
    } finally {
      setDeletingRoleId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Roles Table */}
      {roles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">{t("no_roles")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("create_first_role")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Members</TableHead>
                {canManageRoles && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {role.isSystemRole && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{role.name}</span>
                      {role.isSystemRole && (
                        <Badge variant="outline" className="text-xs">
                          {t("system_role")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {role.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissionCount} permissions</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}</span>
                  </TableCell>
                  {canManageRoles && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!role.isSystemRole && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditRole?.(role)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              {t("edit_role")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingRoleId(role.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("delete_role")}
                            </Button>
                          </>
                        )}
                        {role.isSystemRole && (
                          <span className="text-xs text-muted-foreground">
                            Cannot be modified
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog
        open={!!deletingRoleId}
        onOpenChange={(open) => !open && setDeletingRoleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_role")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_role_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRoleId && handleDeleteRole(deletingRoleId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete_role")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
