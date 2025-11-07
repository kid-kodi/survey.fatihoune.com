import { Button, Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface SubscriptionConfirmationEmailProps {
  name: string;
  planName: string;
  amount: string;
  currency: string;
  interval: string;
  nextBillingDate: string;
  unsubscribeToken?: string;
}

export default function SubscriptionConfirmationEmail({
  name,
  planName,
  amount,
  currency,
  interval,
  nextBillingDate,
  unsubscribeToken,
}: SubscriptionConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Your subscription is confirmed - Welcome to Survey Platform"
      heading="Subscription Confirmed!"
      locale="en"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        Thank you for subscribing to Survey Platform! Your payment has been processed successfully.
      </Text>

      <Section style={summaryBox}>
        <Text style={summaryTitle}>Subscription Summary</Text>
        <Hr style={hr} />
        <table style={table}>
          <tbody>
            <tr>
              <td style={tableLabel}>Plan:</td>
              <td style={tableValue}>{planName}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Amount:</td>
              <td style={tableValue}>
                {currency} {amount} / {interval}
              </td>
            </tr>
            <tr>
              <td style={tableLabel}>Next Billing:</td>
              <td style={tableValue}>{nextBillingDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={text}>
        <strong>What&apos;s included in your {planName} plan:</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Unlimited surveys and responses</li>
        <li style={listItem}>Advanced analytics and insights</li>
        <li style={listItem}>Custom branding</li>
        <li style={listItem}>Priority support</li>
        <li style={listItem}>Data export in multiple formats</li>
      </ul>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/dashboard`}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={text}>
        You can manage your subscription anytime in your{' '}
        <a href={`${appUrl}/settings`} style={link}>
          account settings
        </a>
        .
      </Text>

      <Text style={text}>
        Questions?{' '}
        <a href={`${appUrl}/contact`} style={link}>
          Contact us
        </a>{' '}
        - we&apos;re here to help!
      </Text>

      <Text style={text}>
        Thank you for choosing Survey Platform!
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

const summaryBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '24px',
  margin: '24px 0',
};

const summaryTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const table = {
  width: '100%',
};

const tableLabel = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '8px 0',
  fontWeight: '500',
};

const tableValue = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'right' as const,
  fontWeight: '600',
};
