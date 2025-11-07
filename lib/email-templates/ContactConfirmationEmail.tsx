import { Text } from '@react-email/components';
import React from 'react';
import { BaseEmail, emailStyles } from './BaseEmail';
import { BaseEmailProps } from './types';

/**
 * Email sent to user confirming their contact inquiry was received
 */
export interface ContactConfirmationEmailProps extends BaseEmailProps {
  name: string;
  subject: 'general' | 'sales_custom' | 'support' | 'partnership';
}

export function ContactConfirmationEmail({
  name,
  subject,
  locale = 'en',
}: ContactConfirmationEmailProps) {
  const subjectLabels = {
    general: locale === 'fr' ? 'Demande Générale' : 'General Inquiry',
    sales_custom: locale === 'fr' ? 'Plan Personnalisé/Ventes' : 'Sales/Custom Plan',
    support: locale === 'fr' ? 'Support Technique' : 'Technical Support',
    partnership: locale === 'fr' ? 'Partenariat' : 'Partnership',
  };

  return (
    <BaseEmail
      locale={locale}
      previewText={
        locale === 'fr'
          ? 'Nous avons reçu votre demande'
          : 'We received your inquiry'
      }
    >
      <Text style={emailStyles.heading}>
        {locale === 'fr'
          ? `Bonjour ${name},`
          : `Hello ${name},`}
      </Text>

      <Text style={emailStyles.text}>
        {locale === 'fr'
          ? 'Merci de nous avoir contactés ! Nous avons bien reçu votre demande concernant :'
          : 'Thank you for contacting us! We have received your inquiry regarding:'}
      </Text>

      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            ...emailStyles.text,
            margin: 0,
            fontWeight: '600',
            fontSize: '18px',
            color: '#3b82f6',
          }}
        >
          {subjectLabels[subject]}
        </Text>
      </div>

      <Text style={emailStyles.text}>
        {locale === 'fr'
          ? 'Notre équipe examine votre message et vous répondra dans les plus brefs délais, généralement sous 24 heures ouvrables.'
          : 'Our team is reviewing your message and will respond to you as soon as possible, typically within 24 business hours.'}
      </Text>

      {subject === 'sales_custom' && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '20px',
            borderLeft: '4px solid #3b82f6',
          }}
        >
          <Text style={{ ...emailStyles.text, margin: 0 }}>
            {locale === 'fr' ? (
              <>
                <strong>Plans personnalisés :</strong> Nos plans personnalisés
                incluent des fonctionnalités avancées, un support dédié et des
                options de déploiement flexibles adaptées aux besoins de votre
                entreprise.
              </>
            ) : (
              <>
                <strong>Custom Plans:</strong> Our custom plans include advanced
                features, dedicated support, and flexible deployment options
                tailored to your business needs.
              </>
            )}
          </Text>
        </div>
      )}

      <Text style={emailStyles.text}>
        {locale === 'fr'
          ? "Si vous avez des questions urgentes, n'hésitez pas à répondre directement à cet e-mail."
          : 'If you have any urgent questions, please feel free to reply directly to this email.'}
      </Text>

      <Text
        style={{
          ...emailStyles.text,
          marginTop: '32px',
          marginBottom: '0',
        }}
      >
        {locale === 'fr' ? 'Cordialement,' : 'Best regards,'}
        <br />
        {locale === 'fr'
          ? "L'équipe Survey Platform"
          : 'The Survey Platform Team'}
      </Text>
    </BaseEmail>
  );
}
