import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import React from 'react';
import { BaseEmailProps, getEmailTranslations } from './types';

/**
 * Base email template with company branding and responsive design
 *
 * This template provides a consistent layout for all transactional emails:
 * - Responsive design (mobile, tablet, desktop)
 * - Company branding (logo, colors, footer)
 * - i18n support (English and French)
 *
 * @example
 * ```tsx
 * <BaseEmail locale="en">
 *   <Text style={textStyle}>Your email content here</Text>
 * </BaseEmail>
 * ```
 */
export interface BaseEmailTemplateProps extends BaseEmailProps {
  children: React.ReactNode;
  previewText?: string;
}

export function BaseEmail({
  children,
  locale = 'en',
  previewText = '',
}: BaseEmailTemplateProps) {
  const t = getEmailTranslations(locale);

  return (
    <Html lang={locale}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {previewText && <meta name="description" content={previewText} />}
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header with logo/branding */}
          <Section style={headerStyle}>
            <Text style={logoStyle}>{t.footer.company}</Text>
            <Text style={taglineStyle}>{t.footer.tagline}</Text>
          </Section>

          {/* Main content */}
          <Section style={contentStyle}>{children}</Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} {t.footer.company}.{' '}
              {t.footer.allRightsReserved}.
            </Text>
            <Text style={footerLinksStyle}>
              <Link href="mailto:contact@survey.fatihoune.com" style={linkStyle}>
                {t.footer.contactUs}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles - using inline styles as required by email clients
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  borderRadius: '8px',
  marginTop: '40px',
  marginBottom: '40px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingBottom: '20px',
};

const logoStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 8px 0',
  letterSpacing: '-0.5px',
};

const taglineStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

const contentStyle: React.CSSProperties = {
  padding: '32px 0',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  paddingTop: '20px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0 0 8px 0',
};

const footerLinksStyle: React.CSSProperties = {
  fontSize: '12px',
  margin: '0',
};

const linkStyle: React.CSSProperties = {
  color: '#3b82f6',
  textDecoration: 'none',
};

// Export styles for use in child templates
export const emailStyles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  text: {
    fontSize: '16px',
    color: '#334155',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 24px',
    textDecoration: 'none',
    borderRadius: '6px',
    display: 'inline-block',
    fontWeight: '600',
    fontSize: '16px',
  } as React.CSSProperties,

  buttonContainer: {
    textAlign: 'center',
    margin: '24px 0',
  } as React.CSSProperties,

  code: {
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#0f172a',
  } as React.CSSProperties,
};
