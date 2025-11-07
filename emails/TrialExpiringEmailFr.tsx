import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface TrialExpiringEmailFrProps {
  name: string;
  expiryDate: string;
  daysRemaining: number;
  unsubscribeToken?: string;
}

export default function TrialExpiringEmailFr({
  name,
  expiryDate,
  daysRemaining,
  unsubscribeToken,
}: TrialExpiringEmailFrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview={`Votre essai expire dans ${daysRemaining} jours - Passez à un plan payant`}
      heading="Votre Essai Expire Bientôt"
      locale="fr"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Bonjour {name},</Text>

      <Text style={text}>
        Ceci est un rappel amical que votre essai gratuit expirera dans{' '}
        <strong>{daysRemaining} jours</strong> le <strong>{expiryDate}</strong>.
      </Text>

      <Text style={text}>
        Pour continuer à profiter d&apos;un accès illimité à Survey Platform, passez à un plan payant dès aujourd&apos;hui.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/pricing`}>
          Voir les Plans Tarifaires
        </Button>
      </Section>

      <Text style={text}>
        <strong>Ce que vous conserverez avec un plan payant :</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Sondages et réponses illimités</li>
        <li style={listItem}>Analyses et rapports avancés</li>
        <li style={listItem}>Options de personnalisation de marque</li>
        <li style={listItem}>Support prioritaire</li>
        <li style={listItem}>Export de données dans plusieurs formats</li>
      </ul>

      <Text style={text}>
        Des questions ? Nous sommes là pour vous aider !{' '}
        <a href={`${appUrl}/contact`} style={link}>
          Contactez notre équipe
        </a>
        .
      </Text>

      <Text style={text}>
        Cordialement,
        <br />
        L&apos;équipe Survey Platform
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
