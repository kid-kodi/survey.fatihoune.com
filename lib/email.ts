/**
 * Email sending utilities for Survey Platform
 *
 * This module provides high-level email sending functions for various
 * transactional and marketing emails.
 */

import { sendEmail } from './services/email-service';
import WelcomeEmail from '@/emails/WelcomeEmail';
import WelcomeEmailFr from '@/emails/WelcomeEmailFr';
import TrialExpiringEmail from '@/emails/TrialExpiringEmail';
import TrialExpiringEmailFr from '@/emails/TrialExpiringEmailFr';
import SubscriptionConfirmationEmail from '@/emails/SubscriptionConfirmationEmail';
import SubscriptionConfirmationEmailFr from '@/emails/SubscriptionConfirmationEmailFr';
import PaymentFailedEmail from '@/emails/PaymentFailedEmail';
import PaymentFailedEmailFr from '@/emails/PaymentFailedEmailFr';
import ContactAutoReplyEmail from '@/emails/ContactAutoReplyEmail';
import ContactAutoReplyEmailFr from '@/emails/ContactAutoReplyEmailFr';
import { prisma } from './prisma';
import { randomUUID } from 'crypto';

/**
 * Ensure user has an unsubscribe token
 */
async function ensureUnsubscribeToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { unsubscribeToken: true },
  });

  if (user?.unsubscribeToken) {
    return user.unsubscribeToken;
  }

  // Generate new token
  const token = randomUUID();
  await prisma.user.update({
    where: { id: userId },
    data: { unsubscribeToken: token },
  });

  return token;
}

/**
 * Check if user has unsubscribed from marketing emails
 */
async function hasUnsubscribed(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailPreferences: true },
  });

  const preferences = user?.emailPreferences as { marketing?: boolean } || { marketing: true };
  return !preferences.marketing;
}

export interface SendWelcomeEmailParams {
  userId: string;
  email: string;
  name: string;
  locale?: 'en' | 'fr';
}

/**
 * Send welcome email to newly registered user
 */
export async function sendWelcomeEmail({
  userId,
  email,
  name,
  locale = 'en',
}: SendWelcomeEmailParams) {
  // Check if user has unsubscribed
  if (await hasUnsubscribed(userId)) {
    console.log(`[EMAIL] User ${email} has unsubscribed from marketing emails`);
    return { success: false, error: 'User has unsubscribed' };
  }

  const unsubscribeToken = await ensureUnsubscribeToken(userId);
  const EmailComponent = locale === 'fr' ? WelcomeEmailFr : WelcomeEmail;

  return sendEmail({
    to: email,
    subject: locale === 'fr' ? 'Bienvenue sur Survey Platform' : 'Welcome to Survey Platform',
    react: EmailComponent({ name, unsubscribeToken }),
  });
}

export interface SendTrialExpiringEmailParams {
  userId: string;
  email: string;
  name: string;
  expiryDate: string;
  daysRemaining: number;
  locale?: 'en' | 'fr';
}

/**
 * Send trial expiring reminder email
 */
export async function sendTrialExpiringEmail({
  userId,
  email,
  name,
  expiryDate,
  daysRemaining,
  locale = 'en',
}: SendTrialExpiringEmailParams) {
  // Don't check unsubscribe for critical transactional emails
  const unsubscribeToken = await ensureUnsubscribeToken(userId);
  const EmailComponent = locale === 'fr' ? TrialExpiringEmailFr : TrialExpiringEmail;

  return sendEmail({
    to: email,
    subject:
      locale === 'fr'
        ? `Votre essai expire dans ${daysRemaining} jours`
        : `Your trial expires in ${daysRemaining} days`,
    react: EmailComponent({ name, expiryDate, daysRemaining, unsubscribeToken }),
  });
}

export interface SendSubscriptionConfirmationEmailParams {
  userId: string;
  email: string;
  name: string;
  planName: string;
  amount: string;
  currency: string;
  interval: string;
  nextBillingDate: string;
  locale?: 'en' | 'fr';
}

/**
 * Send subscription confirmation email after successful payment
 */
export async function sendSubscriptionConfirmationEmail({
  userId,
  email,
  name,
  planName,
  amount,
  currency,
  interval,
  nextBillingDate,
  locale = 'en',
}: SendSubscriptionConfirmationEmailParams) {
  // Don't check unsubscribe for transactional emails
  const unsubscribeToken = await ensureUnsubscribeToken(userId);
  const EmailComponent =
    locale === 'fr' ? SubscriptionConfirmationEmailFr : SubscriptionConfirmationEmail;

  return sendEmail({
    to: email,
    subject:
      locale === 'fr'
        ? 'Confirmation de votre abonnement - Survey Platform'
        : 'Your subscription is confirmed - Survey Platform',
    react: EmailComponent({
      name,
      planName,
      amount,
      currency,
      interval,
      nextBillingDate,
      unsubscribeToken,
    }),
  });
}

export interface SendPaymentFailedEmailParams {
  userId: string;
  email: string;
  name: string;
  planName: string;
  amount: string;
  currency: string;
  retryDate?: string;
  locale?: 'en' | 'fr';
}

/**
 * Send payment failed notification email
 */
export async function sendPaymentFailedEmail({
  userId,
  email,
  name,
  planName,
  amount,
  currency,
  retryDate,
  locale = 'en',
}: SendPaymentFailedEmailParams) {
  // Don't check unsubscribe for critical transactional emails
  const unsubscribeToken = await ensureUnsubscribeToken(userId);
  const EmailComponent = locale === 'fr' ? PaymentFailedEmailFr : PaymentFailedEmail;

  return sendEmail({
    to: email,
    subject:
      locale === 'fr'
        ? 'Échec du paiement - Action requise'
        : 'Payment failed - Action required',
    react: EmailComponent({
      name,
      planName,
      amount,
      currency,
      retryDate,
      unsubscribeToken,
    }),
  });
}

export interface SendContactAutoReplyEmailParams {
  email: string;
  name: string;
  subject: string;
  locale?: 'en' | 'fr';
}

/**
 * Send auto-reply confirmation email after contact form submission
 */
export async function sendContactAutoReplyEmail({
  email,
  name,
  subject,
  locale = 'en',
}: SendContactAutoReplyEmailParams) {
  // Don't check unsubscribe for transactional emails
  const EmailComponent = locale === 'fr' ? ContactAutoReplyEmailFr : ContactAutoReplyEmail;

  return sendEmail({
    to: email,
    subject:
      locale === 'fr'
        ? 'Nous avons reçu votre message - Survey Platform'
        : 'We received your message - Survey Platform',
    react: EmailComponent({ name, subject }),
  });
}
