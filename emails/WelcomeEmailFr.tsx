import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './components/EmailLayout';

interface WelcomeEmailFrProps {
  name: string;
  unsubscribeToken?: string;
}

export default function WelcomeEmailFr({ name, unsubscribeToken }: WelcomeEmailFrProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://survey.fatihoune.com';

  return (
    <EmailLayout
      preview="Bienvenue sur Survey Platform - Commencez à créer des sondages"
      heading={`Bienvenue, ${name} !`}
      locale="fr"
      unsubscribeToken={unsubscribeToken}
      showUnsubscribe={true}
    >
      <Text style={text}>
        Nous sommes ravis de vous accueillir. Commençons par créer votre premier sondage.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${appUrl}/dashboard`}>
          Aller au Tableau de bord
        </Button>
      </Section>

      <Text style={text}>
        <strong>Conseils pour démarrer :</strong>
      </Text>

      <ul style={list}>
        <li style={listItem}>Créez votre premier sondage avec notre éditeur intuitif</li>
        <li style={listItem}>Choisissez parmi des modèles prédéfinis pour gagner du temps</li>
        <li style={listItem}>Partagez le lien de votre sondage et commencez à collecter des réponses</li>
        <li style={listItem}>Consultez les analyses et insights en temps réel</li>
      </ul>

      <Text style={text}>
        Besoin d&apos;aide ? Visitez notre{' '}
        <a href={`${appUrl}/features`} style={link}>
          page des fonctionnalités
        </a>{' '}
        ou{' '}
        <a href={`${appUrl}/contact`} style={link}>
          contactez-nous
        </a>
        .
      </Text>

      <Text style={text}>
        Bons sondages !
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
