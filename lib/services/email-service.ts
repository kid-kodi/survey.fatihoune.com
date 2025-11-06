import { Resend } from 'resend';
import React from 'react';

// Singleton Resend client (lazy initialization)
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Parameters for sending an email
 */
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

/**
 * Response from sending an email
 */
export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 *
 * In development mode (NODE_ENV=development), emails are logged to console instead of being sent.
 * In production, emails are sent via Resend API with automatic retry logic.
 *
 * @param params - Email parameters (to, subject, react component)
 * @returns Response object with success status and message ID
 *
 * @example
 * ```typescript
 * import { TestEmail } from '@/lib/email-templates/TestEmail';
 *
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to Survey Platform',
 *   react: TestEmail({ name: 'John Doe' }),
 * });
 * ```
 */
export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailParams): Promise<SendEmailResponse> {
  // Development mode: log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 [DEV] Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('From:', process.env.FROM_EMAIL);
    console.log('---');
    return { success: true, messageId: 'dev-mode' };
  }

  // Validate required environment variables
  if (!process.env.RESEND_API_KEY) {
    const error = 'RESEND_API_KEY environment variable is not set';
    console.error('❌ [EMAIL]', error);
    return { success: false, error };
  }

  if (!process.env.FROM_EMAIL) {
    const error = 'FROM_EMAIL environment variable is not set';
    console.error('❌ [EMAIL]', error);
    return { success: false, error };
  }

  // Production: send via Resend with retry logic
  let attempts = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;
  const resendClient = getResendClient();

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const { data, error } = await resendClient.emails.send({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        react,
      });

      if (error) {
        throw new Error(error.message || 'Unknown error from Resend');
      }

      console.log(`✅ [EMAIL] Sent successfully to ${to} (ID: ${data?.id})`);
      return { success: true, messageId: data?.id };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      console.warn(
        `⚠️ [EMAIL] Attempt ${attempts}/${maxAttempts} failed:`,
        lastError.message
      );

      if (attempts >= maxAttempts) {
        console.error(
          `❌ [EMAIL] Failed to send email after ${maxAttempts} attempts:`,
          lastError.message
        );
        return {
          success: false,
          error: `Failed after ${maxAttempts} attempts: ${lastError.message}`,
        };
      }

      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = 1000 * Math.pow(2, attempts - 1);
      console.log(`⏳ [EMAIL] Retrying in ${backoffMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    error: lastError?.message || 'Unknown error',
  };
}
