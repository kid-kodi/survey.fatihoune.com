'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function PaymentWarningBanner() {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if subscription status is past_due
    fetch('/api/user/subscription-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'past_due') {
          setShowWarning(true);
        }
      })
      .catch((err) => console.error('Failed to fetch subscription status:', err));
  }, []);

  if (!showWarning) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 border-orange-300 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900">{t('payment_failed_title')}</AlertTitle>
      <AlertDescription className="flex items-center justify-between text-orange-800">
        <span>{t('payment_failed_warning')}</span>
        <Button
          onClick={() => router.push('/billing')}
          size="sm"
          variant="outline"
          className="ml-4 border-orange-400 text-orange-700 hover:bg-orange-100"
        >
          {t('update_payment')}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
