import { Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface ContactAutoReplyEmailFrProps {
  name: string;
  subject: string;
  unsubscribeToken?: string;
}

export default function ContactAutoReplyEmailFr({
  name,
  subject,
  unsubscribeToken,
}: ContactAutoReplyEmailFrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Nous avons reçu votre message - Support Survey Platform"
      heading="Merci de Nous Avoir Contactés"
      locale="fr"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={false}
    >
      <Text style={text}>Bonjour {name},</Text>

      <Text style={text}>
        Merci d'avoir contacté Survey Platform. Nous avons reçu votre message concernant :
      </Text>

      <Section style={subjectBox}>
        <Text style={subjectText}>"{subject}"</Text>
      </Section>

      <Text style={text}>
        Notre équipe d&apos;assistance examinera votre demande et répondra dans un délai de{' '}
        <strong>24 à 48 heures</strong> pendant les jours ouvrables.
      </Text>

      <Text style={text}>
        <strong>En attendant, ces ressources pourraient vous être utiles :</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>
          <a href={`${appUrl}/features`} style={link}>
            Aperçu des Fonctionnalités
          </a>{' '}
          - Découvrez les capacités de notre plateforme
        </li>
        <li style={listItem}>
          <a href={`${appUrl}/pricing`} style={link}>
            Plans Tarifaires
          </a>{' '}
          - Comparez nos options d'abonnement
        </li>
        <li style={listItem}>
          <a href={`${appUrl}/about`} style={link}>
            À Propos
          </a>{' '}
          - En savoir plus sur notre équipe et notre mission
        </li>
      </ul>

      <Text style={text}>
        Si votre demande est urgente, veuillez répondre à cet email avec &quot;URGENT&quot; dans l&apos;objet.
      </Text>

      <Text style={text}>
        Merci pour votre patience !
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
