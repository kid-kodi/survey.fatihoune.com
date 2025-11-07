import { SubscriptionList } from "@/components/admin/subscription-list";

export default async function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage user subscriptions, extend periods, and modify plans
        </p>
      </div>

      <SubscriptionList />
    </div>
  );
}
