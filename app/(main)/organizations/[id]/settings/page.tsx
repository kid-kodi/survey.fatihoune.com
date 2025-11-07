"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Users, Shield, Settings as SettingsIcon } from "lucide-react";
import { ManageMembers } from "@/components/organizations/ManageMembers";
import { InviteMemberModal } from "@/components/organizations/InviteMemberModal";
import { ManageRoles } from "@/components/organizations/ManageRoles";
import { CreateRoleModal } from "@/components/organizations/CreateRoleModal";
import { EditRoleModal } from "@/components/organizations/EditRoleModal";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  role: string;
  memberCount: number;
  surveyCount: number;
}

interface UserPermissions {
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageOrganization: boolean;
}

export default function OrganizationSettingsPage() {
  const t = useTranslations("Organization");
  const tDashboard = useTranslations("Dashboard");
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canManageUsers: false,
    canManageRoles: false,
    canManageOrganization: false,
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [editingRole, setEditingRole] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchOrganizationData();
    fetchUserSession();
  }, [organizationId]);

  const fetchOrganizationData = async () => {
    try {
      // Fetch organization details
      const orgResponse = await fetch(`/api/organizations/${organizationId}`);
      if (!orgResponse.ok) {
        throw new Error("Failed to fetch organization");
      }
      const orgData = await orgResponse.json();
      setOrganization(orgData.organization);

      // Fetch user permissions
      const permResponse = await fetch(
        `/api/organizations/${organizationId}/permissions`
      );
      if (permResponse.ok) {
        const permData = await permResponse.json();
        setPermissions({
          canManageUsers: permData.permissions.includes("manage_users"),
          canManageRoles: permData.permissions.includes("manage_roles"),
          canManageOrganization: permData.permissions.includes("manage_organization"),
        });
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
      toast.error("Failed to load organization");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user?.id || "");
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Organization not found</h2>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            {tDashboard("back_to_dashboard")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tDashboard("back_to_dashboard")}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("organization_settings")}
        </h1>
        <p className="text-muted-foreground">{organization.name}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            {t("members_tab")}
          </TabsTrigger>
          <TabsTrigger value="roles" disabled={!permissions.canManageRoles}>
            <Shield className="mr-2 h-4 w-4" />
            {t("roles_tab")}
          </TabsTrigger>
          <TabsTrigger
            value="general"
            disabled={!permissions.canManageOrganization}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            {t("general_tab")}
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("members_tab")}</CardTitle>
                <CardDescription>
                  Manage members and their roles in {organization.name}
                </CardDescription>
              </div>
              {permissions.canManageUsers && (
                <InviteMemberModal
                  organizationId={organizationId}
                  onSuccess={() => {
                    // Refresh will be handled by ManageMembers component
                  }}
                />
              )}
            </CardHeader>
            <CardContent>
              <ManageMembers
                organizationId={organizationId}
                currentUserId={currentUserId}
                canManageUsers={permissions.canManageUsers}
              />
            </CardContent>
          </Card>

          {/* Pending Invitations Section */}
          {permissions.canManageUsers && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("pending_invitations")}</CardTitle>
                <CardDescription>
                  View and manage pending organization invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pending invitations feature coming soon...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("roles_tab")}</CardTitle>
                <CardDescription>
                  Manage roles and permissions for {organization.name}
                </CardDescription>
              </div>
              {permissions.canManageRoles && (
                <CreateRoleModal
                  organizationId={organizationId}
                  onSuccess={() => setRefreshKey((k) => k + 1)}
                />
              )}
            </CardHeader>
            <CardContent>
              <ManageRoles
                key={refreshKey}
                organizationId={organizationId}
                canManageRoles={permissions.canManageRoles}
                onEditRole={(role) => setEditingRole(role)}
                onRefresh={() => setRefreshKey((k) => k + 1)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t("general_tab")}</CardTitle>
              <CardDescription>
                Manage general organization settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                General settings feature coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Modal */}
      {editingRole && (
        <EditRoleModal
          organizationId={organizationId}
          role={editingRole}
          open={!!editingRole}
          onOpenChange={(open) => !open && setEditingRole(null)}
          onSuccess={() => {
            setEditingRole(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
