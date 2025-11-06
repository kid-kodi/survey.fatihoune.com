'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TrialStatusIndicatorProps {
  trialEndDate: Date | string;
  compact?: boolean;
}

export function TrialStatusIndicator({
  trialEndDate,
  compact = false,
}: TrialStatusIndicatorProps) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const t = useTranslations('Subscription');
  const router = useRouter();

  useEffect(() => {
    const calculateDaysRemaining = () => {
      const endDate = new Date(trialEndDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));
    };

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [trialEndDate]);

  const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
  const hasExpired = daysRemaining === 0;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
          hasExpired
            ? 'bg-red-100 text-red-800'
            : isExpiringSoon
            ? 'bg-orange-100 text-orange-800'
            : 'bg-blue-100 text-blue-800'
        }`}
      >
        <Sparkles className="h-4 w-4" />
        {hasExpired
          ? t('trial_expired')
          : t('trial_remaining', { days: daysRemaining })}
      </div>
    );
  }

  return (
    <Card
      className={`border-2 ${
        hasExpired
          ? 'border-red-300 bg-red-50'
          : isExpiringSoon
          ? 'border-orange-300 bg-orange-50'
          : 'border-blue-300 bg-blue-50'
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${
              hasExpired
                ? 'bg-red-100'
                : isExpiringSoon
                ? 'bg-orange-100'
                : 'bg-blue-100'
            }`}
          >
            <Clock
              className={`h-6 w-6 ${
                hasExpired
                  ? 'text-red-600'
                  : isExpiringSoon
                  ? 'text-orange-600'
                  : 'text-blue-600'
              }`}
            />
          </div>

          <div className="flex-1">
            <h3
              className={`text-lg font-semibold mb-1 ${
                hasExpired
                  ? 'text-red-900'
                  : isExpiringSoon
                  ? 'text-orange-900'
                  : 'text-blue-900'
              }`}
            >
              {hasExpired
                ? t('trial_expired_title')
                : t('trial_active_title')}
            </h3>
            <p
              className={`text-sm mb-3 ${
                hasExpired
                  ? 'text-red-700'
                  : isExpiringSoon
                  ? 'text-orange-700'
                  : 'text-blue-700'
              }`}
            >
              {hasExpired
                ? t('trial_expired_message')
                : isExpiringSoon
                ? t('trial_expiring_soon', { days: daysRemaining })
                : t('trial_remaining', { days: daysRemaining })}
            </p>

            {(hasExpired || isExpiringSoon) && (
              <Button
                onClick={() => router.push('/pricing')}
                size="sm"
                className={
                  hasExpired
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }
              >
                {t('trial_upgrade_now')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
