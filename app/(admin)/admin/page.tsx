import { UserSearch } from "@/components/admin/user-search";
import { ImpersonationHistory } from "@/components/admin/impersonation-history";

export default async function AdminDashboardPage() {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, impersonation, and system settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">User Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Search and manage user accounts
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Impersonation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            View as users for support
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Audit Log</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track admin actions
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">User Impersonation</h2>
          <UserSearch />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Impersonation History</h2>
          <ImpersonationHistory />
        </div>
      </div>
    </div>
  );
}
