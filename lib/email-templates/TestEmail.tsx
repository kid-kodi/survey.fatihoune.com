import { Text, Link, Section } from '@react-email/components';
import React from 'react';
import { BaseEmail, emailStyles } from './BaseEmail';
import { BaseEmailProps, getEmailTranslations } from './types';

/**
 * Test email template for development and validation
 *
 * This template demonstrates the base email layout and can be used
 * to test email sending functionality.
 */
export interface TestEmailProps extends BaseEmailProps {
  name: string;
}

export function TestEmail({ name, locale = 'en' }: TestEmailProps) {
  const t = getEmailTranslations(locale);

  const content = {
    en: {
      title: 'Test Email',
      intro: `This is a test email to verify that the email service is working correctly.`,
      recipientInfo: 'This email was sent to:',
      features: {
        title: 'Features Verified:',
        items: [
          '✅ Email service configuration',
          '✅ React Email template rendering',
          '✅ Internationalization support',
          '✅ Responsive design',
          '✅ Resend API integration',
        ],
      },
      action: 'Test Action Button',
      footer: 'If you received this email, everything is working correctly!',
      docs: 'View Documentation',
    },
    fr: {
      title: 'Email de Test',
      intro: `Ceci est un email de test pour vérifier que le service d'email fonctionne correctement.`,
      recipientInfo: 'Cet email a été envoyé à :',
      features: {
        title: 'Fonctionnalités vérifiées :',
        items: [
          '✅ Configuration du service email',
          '✅ Rendu du template React Email',
          '✅ Support de l\'internationalisation',
          '✅ Design responsive',
          '✅ Intégration API Resend',
        ],
      },
      action: 'Bouton d\'Action Test',
      footer: 'Si vous avez reçu cet email, tout fonctionne correctement !',
      docs: 'Voir la Documentation',
    },
  };

  const text = content[locale];

  return (
    <BaseEmail locale={locale} previewText={text.title}>
      <Text style={emailStyles.heading}>
        {t.greeting}, {name}!
      </Text>

      <Text style={emailStyles.text}>{text.intro}</Text>

      <Section style={{ marginBottom: '24px' }}>
        <Text style={{ ...emailStyles.text, fontWeight: '600', marginBottom: '8px' }}>
          {text.features.title}
        </Text>
        {text.features.items.map((item, index) => (
          <Text key={index} style={{ ...emailStyles.text, margin: '4px 0' }}>
            {item}
          </Text>
        ))}
      </Section>

      <Section style={emailStyles.buttonContainer}>
        <Link
          href="https://survey.fatihoune.com"
          style={emailStyles.button}
        >
          {text.action}
        </Link>
      </Section>

      <Text style={{ ...emailStyles.text, fontSize: '14px', color: '#64748b' }}>
        {text.recipientInfo}{' '}
        <span style={emailStyles.code}>{name.toLowerCase()}@example.com</span>
      </Text>

      <Text style={{ ...emailStyles.text, fontSize: '14px', color: '#64748b' }}>
        {text.footer}
      </Text>

      <Section style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link
          href="https://resend.com/docs"
          style={{ color: '#3b82f6', fontSize: '14px', textDecoration: 'underline' }}
        >
          {text.docs}
        </Link>
      </Section>
    </BaseEmail>
  );
}

// Default export for React Email preview
export default TestEmail;
