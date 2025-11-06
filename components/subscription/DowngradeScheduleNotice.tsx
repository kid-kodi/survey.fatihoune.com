'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

interface DowngradeScheduleNoticeProps {
  newPlanName: string;
  effectiveDate: Date;
}

export function DowngradeScheduleNotice({
  newPlanName,
  effectiveDate,
}: DowngradeScheduleNoticeProps) {
  const t = useTranslations('Subscription');

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        {t('downgrade_scheduled', {
          plan: newPlanName,
          date: format(effectiveDate, 'PPP'),
        })}
      </AlertDescription>
    </Alert>
  );
}
