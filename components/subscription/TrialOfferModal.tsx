'use client';

import { useState } from 'react';
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
import { Check, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TrialOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRO_FEATURES = [
  '1 organization',
  '5 team members',
  '50 surveys',
  'Advanced analytics',
  'Priority support',
  'Custom domain',
];

export function TrialOfferModal({ open, onOpenChange }: TrialOfferModalProps) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const t = useTranslations('Subscription');

  async function handleStartTrial() {
    setIsStarting(true);

    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t('trial_start_failed'));
        return;
      }

      // Close modal and refresh the page
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to start trial:', error);
      alert(t('trial_start_failed'));
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <DialogTitle className="text-2xl">{t('trial_offer_title')}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {t('trial_offer_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="font-semibold text-blue-900 mb-1">
              {t('trial_offer_highlight')}
            </p>
            <p className="text-sm text-blue-700">{t('trial_offer_no_card')}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-gray-900 mb-3">
              {t('trial_offer_features_included')}
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
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isStarting}
            className="w-full sm:w-auto"
          >
            {t('trial_offer_maybe_later')}
          </Button>
          <Button
            onClick={handleStartTrial}
            disabled={isStarting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isStarting ? t('trial_offer_starting') : t('trial_offer_start_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
