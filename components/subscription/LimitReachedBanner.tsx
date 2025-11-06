'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface LimitReachedBannerProps {
  resourceType: 'survey' | 'organization' | 'member';
}

export function LimitReachedBanner({ resourceType }: LimitReachedBannerProps) {
  const t = useTranslations('Subscription');
  const router = useRouter();

  const messages = {
    survey: {
      title: t('survey_limit_reached'),
      description: t('survey_limit_banner_description'),
    },
    organization: {
      title: t('organization_limit_reached'),
      description: t('organization_limit_banner_description'),
    },
    member: {
      title: t('member_limit_reached'),
      description: t('member_limit_banner_description'),
    },
  };

  const message = messages[resourceType];

  return (
    <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message.description}</span>
        <Button
          onClick={() => router.push('/pricing')}
          size="sm"
          variant="outline"
          className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
        >
          {t('upgrade')}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
