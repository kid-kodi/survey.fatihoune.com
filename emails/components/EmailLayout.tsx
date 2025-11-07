import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  heading?: string;
  children: React.ReactNode;
  locale?: 'en' | 'fr';
  unsubscribeToken?: string;
  showUnsubscribe?: boolean;
}

export default function EmailLayout({
  preview,
  heading,
  children,
  locale = 'en',
  unsubscribeToken,
  showUnsubscribe = true,
}: EmailLayoutProps) {
  const currentYear = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  const translations = {
    en: {
      viewInBrowser: 'View in browser',
      unsubscribe: 'Unsubscribe',
      allRightsReserved: 'All rights reserved.',
      poweredBy: 'Powered by Survey Platform',
    },
    fr: {
      viewInBrowser: 'Voir dans le navigateur',
      unsubscribe: 'Se désabonner',
      allRightsReserved: 'Tous droits réservés.',
      poweredBy: 'Propulsé par Survey Platform',
    },
  };

  const t = translations[locale];

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${appUrl}/logo.png`}
              width="150"
              height="50"
              alt="Survey Platform"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {heading && <Heading style={h1}>{heading}</Heading>}
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {currentYear} Survey Platform. {t.allRightsReserved}
            </Text>
            <Text style={footerText}>
              {t.poweredBy}
            </Text>
            {showUnsubscribe && unsubscribeToken && (
              <Text style={footerText}>
                <Link href={`${appUrl}/unsubscribe?token=${unsubscribeToken}`} style={footerLink}>
                  {t.unsubscribe}
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 20px',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 32px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  lineHeight: '1.3',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  padding: '0 32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '4px 0',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
