'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export function PlanBadge() {
  const t = useTranslations('Subscription');
  const [plan, setPlan] = useState<string>('Free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/plan')
      .then((res) => res.json())
      .then((data) => {
        setPlan(data.plan?.name || 'Free');
        setIsLoading(false);
      })
      .catch(() => {
        setPlan('Free');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return null;
  }

  const planColors = {
    Free: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    Pro: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    Premium: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  };

  const color = planColors[plan as keyof typeof planColors] || planColors.Free;

  return (
    <Badge className={color}>
      {t(`${plan.toLowerCase()}_plan`)}
    </Badge>
  );
}
