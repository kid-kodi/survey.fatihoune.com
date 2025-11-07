import { Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface ContactAutoReplyEmailProps {
  name: string;
  subject: string;
  unsubscribeToken?: string;
}

export default function ContactAutoReplyEmail({
  name,
  subject,
  unsubscribeToken,
}: ContactAutoReplyEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="We've received your message - Survey Platform Support"
      heading="Thank You for Contacting Us"
      locale="en"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Hi {name},</Text>

      <Text style={text}>
        Thank you for reaching out to Survey Platform. We've received your message regarding:
      </Text>

      <Section style={subjectBox}>
        <Text style={subjectText}>"{subject}"</Text>
      </Section>

      <Text style={text}>
        Our support team will review your inquiry and respond within <strong>24-48 hours</strong> during
        business days.
      </Text>

      <Text style={text}>
        <strong>In the meantime, you might find these resources helpful:</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>
          <a href={`${appUrl}/features`} style={link}>
            Features Overview
          </a>{' '}
          - Learn about our platform capabilities
        </li>
        <li style={listItem}>
          <a href={`${appUrl}/pricing`} style={link}>
            Pricing Plans
          </a>{' '}
          - Compare our subscription options
        </li>
        <li style={listItem}>
          <a href={`${appUrl}/about`} style={link}>
            About Us
          </a>{' '}
          - Learn more about our team and mission
        </li>
      </ul>

      <Text style={text}>
        If your inquiry is urgent, please reply to this email with &quot;URGENT&quot; in the subject line.
      </Text>

      <Text style={text}>
        Thank you for your patience!
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

const subjectBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '6px',
  padding: '16px 20px',
  margin: '24px 0',
};

const subjectText = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#1f2937',
  margin: '0',
};
