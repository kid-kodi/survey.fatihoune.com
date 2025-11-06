'use client';

import { useTranslations } from 'next-intl';

interface OrganizationUsageIndicatorProps {
  currentCount: number;
  limit: number | null;
}

export function OrganizationUsageIndicator({
  currentCount,
  limit,
}: OrganizationUsageIndicatorProps) {
  const t = useTranslations('Subscription');

  if (limit === null) {
    return (
      <div className="text-sm text-gray-600">
        {t('unlimited_organizations')}
      </div>
    );
  }

  const percentage = limit > 0 ? (currentCount / limit) * 100 : 0;
  const colorClass = percentage >= 100 ? 'text-red-600' : percentage >= 80 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="space-y-2">
      <div className={`text-sm font-medium ${colorClass}`}>
        {t('organizations_used', { current: currentCount, limit })}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
