import { Button, Section, Text, Hr } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface SubscriptionConfirmationEmailFrProps {
  name: string;
  planName: string;
  amount: string;
  currency: string;
  interval: string;
  nextBillingDate: string;
  unsubscribeToken?: string;
}

export default function SubscriptionConfirmationEmailFr({
  name,
  planName,
  amount,
  currency,
  interval,
  nextBillingDate,
  unsubscribeToken,
}: SubscriptionConfirmationEmailFrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Votre abonnement est confirmé - Bienvenue sur Survey Platform"
      heading="Abonnement Confirmé !"
      locale="fr"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Bonjour {name},</Text>

      <Text style={text}>
        Merci de vous être abonné à Survey Platform ! Votre paiement a été traité avec succès.
      </Text>

      <Section style={summaryBox}>
        <Text style={summaryTitle}>Résumé de l'Abonnement</Text>
        <Hr style={hr} />
        <table style={table}>
          <tbody>
            <tr>
              <td style={tableLabel}>Plan :</td>
              <td style={tableValue}>{planName}</td>
            </tr>
            <tr>
              <td style={tableLabel}>Montant :</td>
              <td style={tableValue}>
                {currency} {amount} / {interval}
              </td>
            </tr>
            <tr>
              <td style={tableLabel}>Prochaine Facturation :</td>
              <td style={tableValue}>{nextBillingDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={text}>
        <strong>Ce qui est inclus dans votre plan {planName} :</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Sondages et réponses illimités</li>
        <li style={listItem}>Analyses et insights avancés</li>
        <li style={listItem}>Personnalisation de marque</li>
        <li style={listItem}>Support prioritaire</li>
        <li style={listItem}>Export de données dans plusieurs formats</li>
      </ul>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/dashboard`}>
          Aller au Tableau de bord
        </Button>
      </Section>

      <Text style={text}>
        Vous pouvez gérer votre abonnement à tout moment dans vos{' '}
        <a href={`${appUrl}/settings`} style={link}>
          paramètres de compte
        </a>
        .
      </Text>

      <Text style={text}>
        Des questions ?{' '}
        <a href={`${appUrl}/contact`} style={link}>
          Contactez-nous
        </a>{' '}
        - nous sommes là pour vous aider !
      </Text>

      <Text style={text}>
        Merci d'avoir choisi Survey Platform !
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
