import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { DowngradeScheduleNotice } from '@/components/subscription/DowngradeScheduleNotice';
import { PaymentHistory } from '@/components/billing/PaymentHistory';
import { UsageMetrics } from '@/components/billing/UsageMetrics';
import { CancelSubscriptionButton } from '@/components/billing/CancelSubscriptionButton';
import { getTranslations } from 'next-intl/server';
import { format } from 'date-fns';

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await import('next/headers').then(m => m.headers()) });

  if (!session) {
    redirect('/login');
  }

  const t = await getTranslations('Billing');

  // Get user with active or cancelled subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        where: {
          status: { in: ['active', 'trialing', 'cancelled'] }
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      currentPlan: true,
    },
  });

  const subscription = user?.subscriptions[0];
  const currentPlan = user?.currentPlan;

  async function handleManageBilling() {
    'use server';

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.url) {
      redirect(data.url);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('plan_details')}</p>
      </div>

      {/* Downgrade Schedule Notice */}
      {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div className="mb-6">
          <DowngradeScheduleNotice
            newPlanName="Free"
            effectiveDate={subscription.currentPeriodEnd}
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{t('current_plan')}</CardTitle>
            <CardDescription>{t('plan_details')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{currentPlan?.name || 'Free'}</p>
                {subscription && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {subscription.plan.price / 100} {subscription.plan.currency}/{subscription.plan.interval}
                  </p>
                )}
              </div>

              {subscription && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('next_billing_date')}:{' '}
                    {subscription.currentPeriodEnd ? format(subscription.currentPeriodEnd, 'PPP') : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('status')}: <span className="capitalize">{subscription.status}</span>
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <form action={handleManageBilling}>
                  <Button type="submit" className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('manage_payment_method')}
                  </Button>
                </form>

                {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
                  <CancelSubscriptionButton subscriptionId={subscription.id} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        <UsageMetrics userId={session.user.id} />
      </div>

      {/* Payment History */}
      <div className="mt-8">
        <PaymentHistory userId={session.user.id} />
      </div>
    </div>
  );
}
