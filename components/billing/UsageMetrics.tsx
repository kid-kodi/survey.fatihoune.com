import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from 'next-intl/server';

export async function UsageMetrics({ userId }: { userId: string }) {
  const t = await getTranslations('Billing');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      currentPlan: {
        include: { limits: true },
      },
    },
  });

  const usageTracking = await prisma.usageTracking.findMany({
    where: { userId },
  });

  const getUsage = (type: string) => {
    return usageTracking.find((u) => u.resourceType === type)?.currentCount || 0;
  };

  const getLimit = (type: string) => {
    const limit = user?.currentPlan?.limits.find((l) => l.limitType === type);
    if (!limit || limit.limitValue === 'unlimited') return null;
    return parseInt(limit.limitValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('usage_metrics')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{t('surveys')}</span>
            <span>
              {getUsage('survey')} / {getLimit('surveys') ?? t('unlimited')}
            </span>
          </div>
          {getLimit('surveys') && (
            <Progress value={(getUsage('survey') / getLimit('surveys')!) * 100} />
          )}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{t('organizations')}</span>
            <span>
              {getUsage('organization')} / {getLimit('organizations') ?? t('unlimited')}
            </span>
          </div>
          {getLimit('organizations') && (
            <Progress value={(getUsage('organization') / getLimit('organizations')!) * 100} />
          )}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>{t('members')}</span>
            <span>
              {getUsage('user')} / {getLimit('users') ?? t('unlimited')}
            </span>
          </div>
          {getLimit('users') && (
            <Progress value={(getUsage('user') / getLimit('users')!) * 100} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
