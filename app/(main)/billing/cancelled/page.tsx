import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function BillingCancelledPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then(h => h.headers()),
  });

  if (!session) {
    redirect('/login');
  }

  const t = await getTranslations('Subscription');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">{t('upgrade_cancelled')}</h1>
        <p className="text-gray-600 mb-8">
          {t('upgrade_cancelled_message')}
        </p>

        <div className="space-y-4">
          <Link href="/pricing">
            <Button className="w-full">
              {t('try_again')}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              {t('return_to_dashboard')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
