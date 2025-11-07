import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface WelcomeEmailProps {
  name: string;
  unsubscribeToken?: string;
}

export default function WelcomeEmail({ name, unsubscribeToken }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Welcome to Survey Platform - Get started creating surveys"
      heading={`Welcome, ${name}!`}
      locale="en"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={true}
    >
      <Text style={text}>
        We&apos;re excited to have you on board. Let&apos;s get you started creating your first survey.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/dashboard`}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={text}>
        <strong>Getting Started Tips:</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Create your first survey using our intuitive builder</li>
        <li style={listItem}>Choose from pre-built templates to save time</li>
        <li style={listItem}>Share your survey link and start collecting responses</li>
        <li style={listItem}>View real-time analytics and insights</li>
      </ul>

      <Text style={text}>
        Need help? Visit our{' '}
        <a href={`${appUrl}/features`} style={link}>
          features page
        </a>{' '}
        or{' '}
        <a href={`${appUrl}/contact`} style={link}>
          contact us
        </a>
        .
      </Text>

      <Text style={text}>
        Happy surveying!
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
