'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DowngradeWarningProps {
  violations: Array<{ type: string; current: number; limit: number }>;
}

export function DowngradeWarning({ violations }: DowngradeWarningProps) {
  const t = useTranslations('Subscription');

  if (violations.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t('downgrade_blocked')}</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{t('downgrade_usage_warning')}</p>
        <ul className="list-disc list-inside space-y-1">
          {violations.map((violation) => (
            <li key={violation.type}>
              {t('violation_message', {
                type: t(violation.type),
                current: violation.current,
                limit: violation.limit,
                excess: violation.current - violation.limit,
              })}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
