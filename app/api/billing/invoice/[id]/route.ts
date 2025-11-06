import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/services/stripe';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await import('next/headers').then(m => m.headers()),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: paymentIntentId } = await params;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID required' }, { status: 400 });
    }

    // Get payment from database to verify ownership
    const payment = await prisma.payment.findUnique({
      where: { providerPaymentId: paymentIntentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify ownership
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only support Stripe invoices for now
    if (payment.provider !== 'stripe') {
      return NextResponse.json(
        { error: 'Invoice download only available for Stripe payments' },
        { status: 400 }
      );
    }

    // Get payment intent from Stripe with expanded invoice
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['invoice'],
    });

    // Check if payment intent has an invoice
    const invoiceId = (paymentIntent as { invoice?: string | object }).invoice;

    if (!invoiceId) {
      return NextResponse.json({ error: 'No invoice found for this payment' }, { status: 404 });
    }

    // Get invoice details
    const invoice = typeof invoiceId === 'string'
      ? await stripe.invoices.retrieve(invoiceId)
      : (invoiceId as { invoice_pdf?: string });

    if (!invoice.invoice_pdf) {
      return NextResponse.json({ error: 'Invoice PDF not available' }, { status: 404 });
    }

    // Redirect to Stripe invoice PDF
    return NextResponse.redirect(invoice.invoice_pdf);
  } catch (error: unknown) {
    console.error('Invoice download error:', error);

    if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: 'Invalid payment or invoice' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to retrieve invoice' },
      { status: 500 }
    );
  }
}
