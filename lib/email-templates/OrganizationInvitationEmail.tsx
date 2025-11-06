import { BaseEmail, emailStyles } from './BaseEmail';
import { Text, Section, Button, Link } from '@react-email/components';
import React from 'react';
import { EmailLocale } from './types';

/**
 * Email template for organization invitations
 *
 * Sent when a user is invited to join an organization.
 * Includes accept/decline links and invitation expiration info.
 */
export interface OrganizationInvitationEmailProps {
  inviteeName: string; // Recipient's email (or name if known)
  inviterName: string;
  organizationName: string;
  roleName: string;
  invitationUrl: string;
  declineUrl: string;
  expiresInDays: number;
  locale?: EmailLocale;
}

/**
 * Translations for organization invitation emails
 */
const translations = {
  en: {
    subject: (orgName: string) => `You've been invited to join ${orgName}`,
    greeting: 'Hello,',
    invitationMessage: (inviter: string, org: string, role: string) =>
      `${inviter} has invited you to join ${org} as a ${role}.`,
    acceptButton: 'Accept Invitation',
    declineLink: 'Decline this invitation',
    expirationWarning: (days: number) =>
      `This invitation expires in ${days} day${days > 1 ? 's' : ''}.`,
    whatHappensNext: 'What happens next?',
    whatHappensNextText:
      'Click the button above to accept the invitation. You will be redirected to join the organization and start collaborating with the team.',
  },
  fr: {
    subject: (orgName: string) => `Vous avez été invité à rejoindre ${orgName}`,
    greeting: 'Bonjour,',
    invitationMessage: (inviter: string, org: string, role: string) =>
      `${inviter} vous a invité à rejoindre ${org} en tant que ${role}.`,
    acceptButton: "Accepter l'invitation",
    declineLink: 'Refuser cette invitation',
    expirationWarning: (days: number) =>
      `Cette invitation expire dans ${days} jour${days > 1 ? 's' : ''}.`,
    whatHappensNext: 'Que se passe-t-il ensuite ?',
    whatHappensNextText:
      "Cliquez sur le bouton ci-dessus pour accepter l'invitation. Vous serez redirigé pour rejoindre l'organisation et commencer à collaborer avec l'équipe.",
  },
};

/**
 * Get subject line for invitation email
 */
export function getInvitationEmailSubject(
  organizationName: string,
  locale: EmailLocale = 'en'
): string {
  return translations[locale].subject(organizationName);
}

export function OrganizationInvitationEmail({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inviteeName,
  inviterName,
  organizationName,
  roleName,
  invitationUrl,
  declineUrl,
  expiresInDays,
  locale = 'en',
}: OrganizationInvitationEmailProps) {
  const t = translations[locale];

  return (
    <BaseEmail
      locale={locale}
      previewText={t.invitationMessage(inviterName, organizationName, roleName)}
    >
      <Text style={emailStyles.text}>{t.greeting}</Text>

      <Text style={emailStyles.text}>
        {t.invitationMessage(inviterName, organizationName, roleName)}
      </Text>

      {/* Accept button */}
      <Section style={emailStyles.buttonContainer}>
        <Button href={invitationUrl} style={emailStyles.button}>
          {t.acceptButton}
        </Button>
      </Section>

      {/* What happens next */}
      <Text style={{ ...emailStyles.text, marginTop: '24px', fontWeight: '600' }}>
        {t.whatHappensNext}
      </Text>
      <Text style={emailStyles.text}>{t.whatHappensNextText}</Text>

      {/* Decline link */}
      <Text style={{ ...emailStyles.text, textAlign: 'center' }}>
        <Link href={declineUrl} style={declineLinkStyle}>
          {t.declineLink}
        </Link>
      </Text>

      {/* Expiration warning */}
      <Text style={expirationWarningStyle}>{t.expirationWarning(expiresInDays)}</Text>
    </BaseEmail>
  );
}

// Additional styles specific to this template
const declineLinkStyle: React.CSSProperties = {
  color: '#64748b',
  textDecoration: 'underline',
  fontSize: '14px',
};

const expirationWarningStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '12px',
  marginTop: '24px',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '6px',
  textAlign: 'center',
  border: '1px solid #fecaca',
};
