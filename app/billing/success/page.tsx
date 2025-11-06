import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function BillingSuccessPage() {
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
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">{t('upgrade_success')}</h1>
        <p className="text-gray-600 mb-8">
          {t('upgrade_success_message')}
        </p>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full">
              {t('go_to_dashboard')}
            </Button>
          </Link>
          <Link href="/billing">
            <Button variant="outline" className="w-full">
              {t('view_billing_details')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
