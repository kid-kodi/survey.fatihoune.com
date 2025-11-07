import { ActivityLog } from "@/components/admin/activity-log";

export default async function ActivityLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Complete audit trail of all administrative actions
        </p>
      </div>

      <ActivityLog />
    </div>
  );
}
