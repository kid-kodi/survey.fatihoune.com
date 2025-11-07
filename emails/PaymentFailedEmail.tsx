import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface PaymentFailedEmailProps {
  name: string;
  planName: string;
  amount: string;
  currency: string;
  retryDate?: string;
  unsubscribeToken?: string;
}

export default function PaymentFailedEmail({
  name,
  planName,
  amount,
  currency,
  retryDate,
  unsubscribeToken,
}: PaymentFailedEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Payment failed - Action required to maintain your subscription"
      heading="Payment Failed"
      locale="en"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        We were unable to process your recent payment for your {planName} subscription.
      </Text>

      <Section style={warningBox}>
        <Text style={warningTitle}>Payment Details</Text>
        <Text style={warningText}>
          Amount: <strong>{currency} {amount}</strong>
          <br />
          Plan: <strong>{planName}</strong>
          {retryDate && (
            <>
              <br />
              Next Retry: <strong>{retryDate}</strong>
            </>
          )}
        </Text>
      </Section>

      <Text style={text}>
        <strong>What you need to do:</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Update your payment method in your account settings</li>
        <li style={listItem}>Ensure your card has sufficient funds</li>
        <li style={listItem}>Check that your billing information is correct</li>
      </ul>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/settings/billing`}>
          Update Payment Method
        </Button>
      </Section>

      <Text style={text}>
        <strong>What happens next?</strong>
      </Text>

      <Text style={text}>
        {retryDate
          ? `We'll automatically retry the payment on ${retryDate}. If payment continues to fail, your subscription may be cancelled.`
          : 'Please update your payment method as soon as possible to avoid service interruption.'}
      </Text>

      <Text style={text}>
        Need help?{' '}
        <a href={`${appUrl}/contact`} style={link}>
          Contact our support team
        </a>{' '}
        - we&apos;re here to assist you.
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
  backgroundColor: '#ef4444',
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

const warningBox = {
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #ef4444',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '24px 0',
};

const warningTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 8px',
};

const warningText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0',
  lineHeight: '22px',
};
