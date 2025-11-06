'use client';

import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';

interface MemberUsageIndicatorProps {
  currentCount: number;
  limit: number | null;
}

export function MemberUsageIndicator({
  currentCount,
  limit,
}: MemberUsageIndicatorProps) {
  const t = useTranslations('Subscription');

  if (limit === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="h-4 w-4" />
        <span>{t('unlimited_members')}</span>
      </div>
    );
  }

  const percentage = limit > 0 ? (currentCount / limit) * 100 : 0;
  const colorClass =
    percentage >= 100
      ? 'text-red-600'
      : percentage >= 80
      ? 'text-yellow-600'
      : 'text-green-600';

  return (
    <div className="space-y-2">
      <div className={`text-sm font-medium flex items-center gap-2 ${colorClass}`}>
        <Users className="h-4 w-4" />
        <span>{t('members_used', { current: currentCount, limit })}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 100
              ? 'bg-red-500'
              : percentage >= 80
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {percentage >= 80 && (
        <p className="text-xs text-gray-600">
          {percentage >= 100
            ? t('member_limit_reached_message')
            : t('member_limit_warning')}
        </p>
      )}
    </div>
  );
}
