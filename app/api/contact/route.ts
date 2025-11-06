import { NextRequest, NextResponse } from 'next/server';
import { contactFormSchema, isRateLimited } from '@/lib/validation';
import { sendEmail } from '@/lib/services/email-service';
import { ContactInquiryEmail } from '@/lib/email-templates/ContactInquiryEmail';
import { ContactConfirmationEmail } from '@/lib/email-templates/ContactConfirmationEmail';

/**
 * POST /api/contact
 *
 * Handles contact form submissions
 * - Validates form data
 * - Applies rate limiting (5 requests per minute per IP)
 * - Sends email to sales team
 * - Sends confirmation email to user
 */
export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Rate limiting: 5 requests per minute per IP
    if (isRateLimited(`contact_${ip}`, 5, 60000)) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, company, inquiryType, message } = validationResult.data;

    // Get locale from headers or default to 'en'
    const locale = req.headers.get('accept-language')?.startsWith('fr') ? 'fr' : 'en';

    // Format timestamp
    const timestamp = new Date().toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Send email to sales team
    const salesEmail = process.env.SALES_EMAIL || 'contact@survey.fatihoune.com';
    const salesEmailResult = await sendEmail({
      to: salesEmail,
      subject: `New Contact Inquiry: ${inquiryType.replace('_', ' ').toUpperCase()} from ${name}`,
      react: ContactInquiryEmail({
        name,
        email,
        company,
        inquiryType,
        message,
        timestamp,
        locale,
      }),
    });

    if (!salesEmailResult.success) {
      console.error('Failed to send email to sales team:', salesEmailResult.error);
      return NextResponse.json(
        {
          error: 'Failed to send inquiry. Please try again later.',
          code: 'EMAIL_SEND_FAILED',
        },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    const confirmationEmailResult = await sendEmail({
      to: email,
      subject:
        locale === 'fr'
          ? 'Nous avons reçu votre demande'
          : 'We received your inquiry',
      react: ContactConfirmationEmail({
        name,
        inquiryType,
        locale,
      }),
    });

    // Log if confirmation email fails, but don't block the request
    if (!confirmationEmailResult.success) {
      console.error(
        'Failed to send confirmation email to user:',
        confirmationEmailResult.error
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been sent successfully. We will contact you soon.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again later.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
