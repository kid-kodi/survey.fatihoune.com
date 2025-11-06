'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/contexts/OrganizationContext';

interface UsageData {
  current: number;
  limit: number | 'unlimited';
  percentage: number;
}

export function MemberUsageWidget() {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const { currentOrganization, isPersonalWorkspace } = useOrganization();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (!isPersonalWorkspace && currentOrganization) {
      fetch(`/api/usage/members?organizationId=${currentOrganization.id}`)
        .then((res) => res.json())
        .then(setUsage)
        .catch((err) => console.error('Failed to fetch member usage:', err));
    }
  }, [currentOrganization, isPersonalWorkspace]);

  // Don't show for personal workspace
  if (isPersonalWorkspace || !usage) return null;

  const isUnlimited = usage.limit === 'unlimited';
  const isNearLimit = usage.percentage >= 80;
  const isAtLimit = usage.percentage >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('member_usage')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isUnlimited ? (
          <p className="text-lg font-semibold text-green-600">
            {t('unlimited_members')}
          </p>
        ) : (
          <>
            <div className="mb-2">
              <p className="text-2xl font-bold">
                {usage.current} / {usage.limit}
              </p>
              <p className="text-sm text-gray-600">
                {t('members_used')}
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
                  {t('member_limit_reached')}
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
