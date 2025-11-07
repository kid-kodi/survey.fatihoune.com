import { Text } from '@react-email/components';
import React from 'react';
import { BaseEmail, emailStyles } from './BaseEmail';
import { BaseEmailProps } from './types';

/**
 * Email sent to support team when a customer submits a contact inquiry
 */
export interface ContactInquiryEmailProps extends BaseEmailProps {
  name: string;
  email: string;
  subject: 'general' | 'sales_custom' | 'support' | 'partnership';
  message: string;
  timestamp: string;
}

export function ContactInquiryEmail({
  name,
  email,
  subject,
  message,
  timestamp,
  locale = 'en',
}: ContactInquiryEmailProps) {
  const subjectLabels = {
    general: locale === 'fr' ? 'Demande Générale' : 'General Inquiry',
    sales_custom: locale === 'fr' ? 'Plan Personnalisé/Ventes' : 'Sales/Custom Plan',
    support: locale === 'fr' ? 'Support' : 'Support',
    partnership: locale === 'fr' ? 'Partenariat' : 'Partnership',
  };

  return (
    <BaseEmail locale={locale} previewText={`New contact inquiry from ${name}`}>
      <Text style={emailStyles.heading}>
        {locale === 'fr' ? 'Nouvelle demande de contact' : 'New Contact Inquiry'}
      </Text>

      <Text style={emailStyles.text}>
        {locale === 'fr'
          ? 'Un nouveau contact a été soumis via le formulaire de contact :'
          : 'A new contact inquiry has been submitted via the contact form:'}
      </Text>

      {/* Contact Details */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td
                style={{
                  padding: '8px 0',
                  fontWeight: '600',
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                {locale === 'fr' ? 'Nom' : 'Name'}:
              </td>
              <td
                style={{
                  padding: '8px 0',
                  color: '#0f172a',
                  fontSize: '14px',
                }}
              >
                {name}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '8px 0',
                  fontWeight: '600',
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                Email:
              </td>
              <td
                style={{
                  padding: '8px 0',
                  color: '#0f172a',
                  fontSize: '14px',
                }}
              >
                <a href={`mailto:${email}`} style={{ color: '#3b82f6' }}>
                  {email}
                </a>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '8px 0',
                  fontWeight: '600',
                  color: '#64748b',
                  fontSize: '14px',
                }}
              >
                {locale === 'fr' ? 'Sujet' : 'Subject'}:
              </td>
              <td
                style={{
                  padding: '8px 0',
                  color: '#0f172a',
                  fontSize: '14px',
                }}
              >
                {subjectLabels[subject]}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: '8px 0',
                  fontWeight: '600',
                  color: '#64748b',
                  fontSize: '14px',
                  verticalAlign: 'top',
                }}
              >
                {locale === 'fr' ? 'Date' : 'Timestamp'}:
              </td>
              <td
                style={{
                  padding: '8px 0',
                  color: '#0f172a',
                  fontSize: '14px',
                }}
              >
                {timestamp}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Message */}
      <Text
        style={{
          ...emailStyles.text,
          fontWeight: '600',
          marginBottom: '8px',
        }}
      >
        {locale === 'fr' ? 'Message' : 'Message'}:
      </Text>
      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #3b82f6',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            ...emailStyles.text,
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </Text>
      </div>

      <Text style={{ ...emailStyles.text, fontSize: '14px', color: '#64748b' }}>
        {locale === 'fr'
          ? 'Veuillez répondre à ce client dans les plus brefs délais.'
          : 'Please respond to this customer as soon as possible.'}
      </Text>
    </BaseEmail>
  );
}
