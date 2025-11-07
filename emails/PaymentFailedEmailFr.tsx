import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface PaymentFailedEmailFrProps {
  name: string;
  planName: string;
  amount: string;
  currency: string;
  retryDate?: string;
  unsubscribeToken?: string;
}

export default function PaymentFailedEmailFr({
  name,
  planName,
  amount,
  currency,
  retryDate,
  unsubscribeToken,
}: PaymentFailedEmailFrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Échec du paiement - Action requise pour maintenir votre abonnement"
      heading="Échec du Paiement"
      locale="fr"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Bonjour {name},</Text>

      <Text style={text}>
        Nous n&apos;avons pas pu traiter votre paiement récent pour votre abonnement {planName}.
      </Text>

      <Section style={warningBox}>
        <Text style={warningTitle}>Détails du Paiement</Text>
        <Text style={warningText}>
          Montant : <strong>{currency} {amount}</strong>
          <br />
          Plan : <strong>{planName}</strong>
          {retryDate && (
            <>
              <br />
              Prochaine tentative : <strong>{retryDate}</strong>
            </>
          )}
        </Text>
      </Section>

      <Text style={text}>
        <strong>Ce que vous devez faire :</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Mettre à jour votre mode de paiement dans les paramètres de votre compte</li>
        <li style={listItem}>Vous assurer que votre carte a des fonds suffisants</li>
        <li style={listItem}>Vérifier que vos informations de facturation sont correctes</li>
      </ul>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/settings/billing`}>
          Mettre à Jour le Mode de Paiement
        </Button>
      </Section>

      <Text style={text}>
        <strong>Que se passe-t-il ensuite ?</strong>
      </Text>

      <Text style={text}>
        {retryDate
          ? `Nous réessaierons automatiquement le paiement le ${retryDate}. Si le paiement continue d'échouer, votre abonnement pourrait être annulé.`
          : 'Veuillez mettre à jour votre mode de paiement dès que possible pour éviter toute interruption de service.'}
      </Text>

      <Text style={text}>
        Besoin d&apos;aide ?{' '}
        <a href={`${appUrl}/contact`} style={link}>
          Contactez notre équipe d'assistance
        </a>{' '}
        - nous sommes là pour vous aider.
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
