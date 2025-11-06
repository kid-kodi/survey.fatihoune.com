'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface CreateOrganizationButtonProps {
  currentPlan: string;
  organizationCount: number;
  organizationLimit: number | null;
}

export function CreateOrganizationButton({
  currentPlan,
  organizationCount,
  organizationLimit,
}: CreateOrganizationButtonProps) {
  const t = useTranslations('Subscription');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Hide button for Free users
  if (currentPlan === 'Free') {
    return null;
  }

  // Check if limit reached for Pro users
  const isLimitReached = organizationLimit !== null && organizationCount >= organizationLimit;

  const handleClick = () => {
    if (isLimitReached) {
      setError(t('organization_limit_reached'));
      return;
    }

    router.push('/organizations/new');
  };

  return (
    <>
      <Button onClick={handleClick} disabled={isLimitReached}>
        <Plus className="h-4 w-4 mr-2" />
        {t('create_organization')}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">{error}</p>
          <Button
            variant="link"
            className="mt-2 p-0 h-auto"
            onClick={() => router.push('/pricing')}
          >
            {t('upgrade_to_premium')}
          </Button>
        </div>
      )}
    </>
  );
}
