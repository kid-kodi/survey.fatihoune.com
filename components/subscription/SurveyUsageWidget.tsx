'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

interface UsageData {
  current: number;
  limit: number | 'unlimited';
  percentage: number;
  isSysAdmin?: boolean;
}

export function SurveyUsageWidget() {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch('/api/usage/surveys')
      .then((res) => res.json())
      .then(setUsage);
  }, []);

  if (!usage) return <div>Loading...</div>;

  const isUnlimited = usage.limit === 'unlimited';
  const isNearLimit = usage.percentage >= 80;
  const isAtLimit = usage.percentage >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t('survey_usage')}
          {usage.isSysAdmin && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUnlimited || usage.isSysAdmin ? (
          <div>
            <p className="text-lg font-semibold text-green-600">
              {usage.isSysAdmin ? 'Unlimited (sys_admin bypass)' : t('unlimited_surveys')}
            </p>
            {usage.isSysAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                System administrators have unlimited survey access
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-2">
              <p className="text-2xl font-bold">
                {usage.current} / {usage.limit}
              </p>
              <p className="text-sm text-gray-600">
                {t('surveys_used', { current: usage.current, limit: usage.limit })}
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
                  {t('survey_limit_reached')}
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
