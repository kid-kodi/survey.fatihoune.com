'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface GracePeriodData {
  hasGracePeriod: boolean;
  graceEndsAt?: string;
  formattedDate?: string;
}

/**
 * Displays a notice when user has an active grace period for Pro features
 *
 * Shows:
 * - Grace period status
 * - End date of grace period
 * - Link to view pricing plans
 */
export function GracePeriodNotice() {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const [gracePeriod, setGracePeriod] = useState<GracePeriodData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's subscription to check for grace period
    fetch('/api/user/subscription-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.graceEndsAt) {
          const graceEndDate = new Date(data.graceEndsAt);
          const now = new Date();

          // Only show if grace period hasn't ended yet
          if (graceEndDate > now) {
            setGracePeriod({
              hasGracePeriod: true,
              graceEndsAt: data.graceEndsAt,
              formattedDate: graceEndDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            });
          }
        }
      })
      .catch((err) => console.error('Failed to fetch grace period:', err))
      .finally(() => setLoading(false));
  }, []);

  // Don't render anything while loading or if no grace period
  if (loading || !gracePeriod?.hasGracePeriod) {
    return null;
  }

  return (
    <Alert className="mb-6 border-amber-300 bg-amber-50">
      <Gift className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">
        {t('grace_period_notice')}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between text-amber-800">
        <span>
          {t('grace_period_message', { date: gracePeriod.formattedDate || '' })}
        </span>
        <Button
          onClick={() => router.push('/pricing')}
          size="sm"
          variant="outline"
          className="ml-4 border-amber-400 text-amber-700 hover:bg-amber-100"
        >
          {t('upgrade')}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
