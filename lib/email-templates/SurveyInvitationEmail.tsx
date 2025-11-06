import { Text, Link, Section } from '@react-email/components';
import React from 'react';
import { BaseEmail, emailStyles } from './BaseEmail';
import { BaseEmailProps, EmailLocale } from './types';

/**
 * Email template for survey invitations
 *
 * This template is sent when a survey creator invites participants via email.
 * It includes the survey details and a personalized invitation link with a token.
 *
 * @example
 * ```tsx
 * <SurveyInvitationEmail
 *   surveyTitle="Customer Satisfaction Survey"
 *   surveyDescription="Help us improve our services"
 *   creatorName="John Doe"
 *   invitationUrl="https://survey.example.com/s/abc123?invitation=xyz"
 *   estimatedTime="5 minutes"
 *   locale="en"
 * />
 * ```
 */
export interface SurveyInvitationEmailProps extends BaseEmailProps {
  surveyTitle: string;
  surveyDescription: string;
  creatorName: string;
  invitationUrl: string;
  estimatedTime?: string;
}

export function SurveyInvitationEmail({
  surveyTitle,
  surveyDescription,
  creatorName,
  invitationUrl,
  estimatedTime = '5 minutes',
  locale = 'en',
}: SurveyInvitationEmailProps) {
  const t = getInvitationTranslations(locale);

  return (
    <BaseEmail locale={locale} previewText={t.previewText(creatorName, surveyTitle)}>
      {/* Greeting */}
      <Text style={emailStyles.text}>{t.greeting},</Text>

      {/* Invitation message */}
      <Text style={emailStyles.text}>{t.invitationMessage(creatorName)}</Text>

      {/* Survey title */}
      <Text style={emailStyles.heading}>{surveyTitle}</Text>

      {/* Survey description */}
      {surveyDescription && (
        <Text style={{ ...emailStyles.text, color: '#64748b' }}>
          {surveyDescription}
        </Text>
      )}

      {/* Estimated time */}
      <Text style={{ ...emailStyles.text, fontSize: '14px', color: '#64748b' }}>
        {t.estimatedTime(estimatedTime)}
      </Text>

      {/* CTA Button */}
      <Section style={emailStyles.buttonContainer}>
        <Link href={invitationUrl} style={emailStyles.button}>
          {t.ctaButton}
        </Link>
      </Section>

      {/* Direct link fallback */}
      <Text
        style={{
          ...emailStyles.text,
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '24px',
        }}
      >
        {t.linkFallback}:{' '}
        <Link href={invitationUrl} style={{ color: '#3b82f6', wordBreak: 'break-all' }}>
          {invitationUrl}
        </Link>
      </Text>

      {/* Privacy notice */}
      <Text
        style={{
          ...emailStyles.text,
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '24px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '16px',
        }}
      >
        {t.privacyNotice}
      </Text>
    </BaseEmail>
  );
}

/**
 * Get localized translations for survey invitation emails
 */
function getInvitationTranslations(locale: EmailLocale) {
  const translations = {
    en: {
      previewText: (creator: string, survey: string) =>
        `${creator} invited you to complete: ${survey}`,
      greeting: 'Hello',
      invitationMessage: (creator: string) =>
        `${creator} has invited you to participate in a survey. Your feedback is important and will help improve our services.`,
      estimatedTime: (time: string) => `⏱️ Estimated time: ${time}`,
      ctaButton: 'Take Survey',
      linkFallback: 'Or copy and paste this link in your browser',
      privacyNotice:
        'Your responses are confidential. This invitation is unique to you and cannot be forwarded to others.',
    },
    fr: {
      previewText: (creator: string, survey: string) =>
        `${creator} vous invite à répondre: ${survey}`,
      greeting: 'Bonjour',
      invitationMessage: (creator: string) =>
        `${creator} vous invite à participer à un sondage. Vos commentaires sont importants et nous aideront à améliorer nos services.`,
      estimatedTime: (time: string) => `⏱️ Temps estimé: ${time}`,
      ctaButton: 'Répondre au sondage',
      linkFallback: 'Ou copiez et collez ce lien dans votre navigateur',
      privacyNotice:
        'Vos réponses sont confidentielles. Cette invitation vous est personnelle et ne peut être transférée à d\'autres personnes.',
    },
  };

  return translations[locale];
}

// Email subject line helper (for use in email service)
export function getSurveyInvitationSubject(creatorName: string, locale: EmailLocale = 'en'): string {
  const subjects = {
    en: `${creatorName} invited you to complete a survey`,
    fr: `${creatorName} vous invite à répondre à un sondage`,
  };
  return subjects[locale];
}
