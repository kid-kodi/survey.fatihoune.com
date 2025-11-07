import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface TrialExpiringEmailProps {
  name: string;
  expiryDate: string;
  daysRemaining: number;
  unsubscribeToken?: string;
}

export default function TrialExpiringEmail({
  name,
  expiryDate,
  daysRemaining,
  unsubscribeToken,
}: TrialExpiringEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview={`Your trial expires in ${daysRemaining} days - Upgrade to continue`}
      heading="Your Trial is Expiring Soon"
      locale="en"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        This is a friendly reminder that your free trial will expire in{' '}
        <strong>{daysRemaining} days</strong> on <strong>{expiryDate}</strong>.
      </Text>

      <Text style={text}>
        To continue enjoying unlimited access to Survey Platform, upgrade to a paid plan today.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/pricing`}>
          View Pricing Plans
        </Button>
      </Section>

      <Text style={text}>
        <strong>What you&apos;ll keep with a paid plan:</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Unlimited surveys and responses</li>
        <li style={listItem}>Advanced analytics and reporting</li>
        <li style={listItem}>Custom branding options</li>
        <li style={listItem}>Priority support</li>
        <li style={listItem}>Export data in multiple formats</li>
      </ul>

      <Text style={text}>
        Questions? We&apos;re here to help!{' '}
        <a href={`${appUrl}/contact`} style={link}>
          Contact our team
        </a>
        .
      </Text>

      <Text style={text}>
        Best regards,
        <br />
        The Survey Platform Team
      </Text>
    </EmailLayout>
  );
}

// Styles
const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  width: '100%',
};

const buttonContainer = {
  padding: '16px 0',
};

const list = {
  paddingLeft: '20px',
  margin: '16px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '8px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
