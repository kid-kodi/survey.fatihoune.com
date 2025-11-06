'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface UpgradeButtonProps {
  currentPlan: string;
}

export function UpgradeButton({ currentPlan }: UpgradeButtonProps) {
  const t = useTranslations('Subscription');
  const router = useRouter();

  // Hide for Premium users
  if (currentPlan === 'Premium') {
    return null;
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => router.push('/pricing')}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {t('upgrade')}
    </Button>
  );
}
