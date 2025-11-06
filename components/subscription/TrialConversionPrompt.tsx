'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TrialConversionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialEndDate?: string;
  daysRemaining: number;
}

const PRO_FEATURES = [
  '1 organization',
  '5 team members',
  '50 surveys',
  'Advanced analytics',
  'Priority support',
  'Custom domain',
];

export function TrialConversionPrompt({
  open,
  onOpenChange,
  trialEndDate,
  daysRemaining,
}: TrialConversionPromptProps) {
  const router = useRouter();
  const t = useTranslations('Subscription');
  const hasExpired = daysRemaining === 0;

  function handleUpgrade() {
    router.push('/pricing');
    onOpenChange(false);
  }

  function handleDismiss() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle
              className={`h-6 w-6 ${
                hasExpired ? 'text-red-500' : 'text-orange-500'
              }`}
            />
            <DialogTitle className="text-2xl">
              {hasExpired
                ? t('trial_conversion_expired_title')
                : t('trial_conversion_expiring_title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {hasExpired
              ? t('trial_conversion_expired_description')
              : t('trial_conversion_expiring_description', {
                  days: daysRemaining,
                })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div
            className={`${
              hasExpired
                ? 'bg-red-50 border-red-200'
                : 'bg-orange-50 border-orange-200'
            } border rounded-lg p-4 mb-4`}
          >
            <p
              className={`font-semibold ${
                hasExpired ? 'text-red-900' : 'text-orange-900'
              } mb-1`}
            >
              {hasExpired
                ? t('trial_conversion_expired_warning')
                : t('trial_conversion_expiring_warning')}
            </p>
            <p
              className={`text-sm ${
                hasExpired ? 'text-red-700' : 'text-orange-700'
              }`}
            >
              {hasExpired
                ? t('trial_conversion_expired_details')
                : t('trial_conversion_expiring_details')}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-gray-900 mb-3">
              {t('trial_conversion_features_title')}
            </p>
            <ul className="space-y-2">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">
                {t('trial_conversion_pricing')}
              </span>{' '}
              {t('trial_conversion_pricing_details')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            {hasExpired
              ? t('trial_conversion_downgrade')
              : t('trial_conversion_remind_later')}
          </Button>
          <Button
            onClick={handleUpgrade}
            className={`w-full sm:w-auto ${
              hasExpired
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {t('trial_conversion_upgrade_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
