'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface TrialExpirationWarningProps {
  trialEndDate: Date | string;
  onDismiss?: () => void;
}

export function TrialExpirationWarning({
  trialEndDate,
  onDismiss,
}: TrialExpirationWarningProps) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
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

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Only show warning if trial expires in 3 days or less
  if (daysRemaining > 3 || daysRemaining === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-orange-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            {t('trial_expiring_soon_title')}
          </h3>
          <div className="mt-2 text-sm text-orange-700">
            <p>
              {t('trial_expiring_soon', { days: daysRemaining })}
              {' '}
              {t('trial_expiring_soon_action')}
            </p>
          </div>
          <div className="mt-4">
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={() => router.push('/pricing')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {t('trial_upgrade_now')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-orange-800 border-orange-300 hover:bg-orange-100"
              >
                {t('trial_dismiss')}
              </Button>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={handleDismiss}
            className="inline-flex rounded-md text-orange-400 hover:text-orange-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
