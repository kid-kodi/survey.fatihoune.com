'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface UsageData {
  current: number;
  limit: number | 'unlimited';
  percentage: number;
}

export function OrganizationUsageWidget() {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch('/api/usage/organizations')
      .then((res) => res.json())
      .then(setUsage)
      .catch((err) => console.error('Failed to fetch organization usage:', err));
  }, []);

  if (!usage) return <div>Loading...</div>;

  const isUnlimited = usage.limit === 'unlimited';
  const isNearLimit = usage.percentage >= 80;
  const isAtLimit = usage.percentage >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('organization_usage')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isUnlimited ? (
          <p className="text-lg font-semibold text-green-600">
            {t('unlimited_organizations')}
          </p>
        ) : (
          <>
            <div className="mb-2">
              <p className="text-2xl font-bold">
                {usage.current} / {usage.limit}
              </p>
              <p className="text-sm text-gray-600">
                {t('organizations_used', { current: usage.current, limit: usage.limit })}
              </p>
            </div>
            <Progress
              value={usage.percentage}
              className={
                isAtLimit
                  ? '[&>div]:bg-red-600'
                  : isNearLimit
                  ? '[&>div]:bg-yellow-500'
                  : '[&>div]:bg-green-600'
              }
            />
            {isAtLimit && (
              <div className="mt-4">
                <p className="text-sm text-red-600 mb-2">
                  {t('organization_limit_reached')}
                </p>
                <Button onClick={() => router.push('/pricing')} size="sm">
                  {t('upgrade')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
