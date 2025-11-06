import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { format } from 'date-fns';

export async function PaymentHistory({ userId }: { userId: string }) {
  const t = await getTranslations('Billing');

  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (payments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('payment_history')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('provider')}</TableHead>
                <TableHead>{t('invoice')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.paidAt ? format(payment.paidAt, 'PPP') : format(payment.createdAt, 'PPP')}
                  </TableCell>
                  <TableCell>
                    {payment.amount / 100} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : payment.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : payment.status === 'refunded'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{payment.provider.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {payment.providerPaymentId && payment.provider === 'stripe' && payment.status === 'completed' && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`/api/billing/invoice/${payment.providerPaymentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
