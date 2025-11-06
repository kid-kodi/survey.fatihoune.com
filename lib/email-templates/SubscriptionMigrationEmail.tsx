import React from 'react';
import { Text, Link } from '@react-email/components';
import { BaseEmail, emailStyles } from './BaseEmail';
import { BaseEmailProps } from './types';

export interface SubscriptionMigrationEmailProps extends BaseEmailProps {
  userName: string;
  assignedPlan: 'Free' | 'Pro';
  hasGracePeriod: boolean;
  graceEndDate?: string;
  pricingUrl: string;
}

/**
 * Email announcing subscription tier migration
 * Sent to all users during subscription rollout
 */
export function SubscriptionMigrationEmail({
  userName,
  assignedPlan,
  hasGracePeriod,
  graceEndDate,
  pricingUrl,
  locale = 'en',
}: SubscriptionMigrationEmailProps) {
  const content = locale === 'en' ? contentEN : contentFR;
  const greeting = locale === 'en' ? 'Hello' : 'Bonjour';

  return (
    <BaseEmail
      locale={locale}
      previewText={
        locale === 'en'
          ? 'Important Update: New Subscription Plans'
          : "Mise à jour importante : Nouveaux forfaits d'abonnement"
      }
    >
      <Text style={emailStyles.heading}>{content.title}</Text>

      <Text style={emailStyles.text}>
        {greeting} {userName},
      </Text>

      <Text style={emailStyles.text}>{content.intro}</Text>

      <Text style={emailStyles.text}>
        <strong>{content.yourPlan}:</strong> {assignedPlan}
      </Text>

      {hasGracePeriod && graceEndDate && (
        <>
          <Text style={{ ...emailStyles.text, ...graceNoticeStyle }}>
            <strong>{content.gracePeriod.title}</strong>
            <br />
            {content.gracePeriod.message.replace('{date}', graceEndDate)}
          </Text>
        </>
      )}

      <Text style={emailStyles.text}>
        <strong>{content.whatThisMeans}:</strong>
      </Text>

      {assignedPlan === 'Free' && (
        <ul style={listStyle}>
          {content.freePlanFeatures.map((feature, idx) => (
            <li key={idx} style={listItemStyle}>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {assignedPlan === 'Pro' && (
        <ul style={listStyle}>
          {content.proPlanFeatures.map((feature, idx) => (
            <li key={idx} style={listItemStyle}>
              {feature}
            </li>
          ))}
        </ul>
      )}

      <Text style={emailStyles.text}>{content.nextSteps}</Text>

      <div style={emailStyles.buttonContainer}>
        <Link href={pricingUrl} style={emailStyles.button}>
          {content.viewPlans}
        </Link>
      </div>

      <Text style={emailStyles.text}>{content.questions}</Text>

      <Text style={emailStyles.text}>
        {content.thankYou}
        <br />
        {content.team}
      </Text>
    </BaseEmail>
  );
}

// English content
const contentEN = {
  title: 'Important Update: New Subscription Plans',
  intro:
    "We're excited to announce that we've launched new subscription tiers to better serve your needs. As a valued user, we've automatically assigned you to a plan based on your current usage.",
  yourPlan: 'Your Assigned Plan',
  gracePeriod: {
    title: '🎁 Special Grace Period',
    message:
      'As a thank you for being an early user, you have full access to Pro features until {date}. This gives you 30 days to explore the platform and decide which plan is right for you.',
  },
  whatThisMeans: 'What This Means',
  freePlanFeatures: [
    'Create up to 5 surveys per month',
    'Access to all basic question types',
    'Basic analytics and reporting',
    'Perfect for personal use and small projects',
  ],
  proPlanFeatures: [
    'Unlimited surveys',
    'Create and manage organizations',
    'Invite team members to collaborate',
    'Advanced analytics and export options',
    'Priority support',
  ],
  nextSteps:
    'No action is required right now. Continue using the platform as usual. If you have a grace period, you can explore all Pro features before making any decisions.',
  viewPlans: 'View All Plans',
  questions:
    'Have questions about the new plans? Feel free to reply to this email or contact our support team.',
  thankYou: 'Thank you for being part of our community!',
  team: 'The Survey Platform Team',
};

// French content
const contentFR = {
  title: "Mise à jour importante : Nouveaux forfaits d'abonnement",
  intro:
    "Nous sommes ravis d'annoncer le lancement de nouveaux forfaits d'abonnement pour mieux répondre à vos besoins. En tant qu'utilisateur précieux, nous vous avons automatiquement attribué un forfait en fonction de votre utilisation actuelle.",
  yourPlan: 'Votre forfait attribué',
  gracePeriod: {
    title: '🎁 Période de grâce spéciale',
    message:
      "Pour vous remercier d'être un utilisateur précoce, vous avez un accès complet aux fonctionnalités Pro jusqu'au {date}. Cela vous donne 30 jours pour explorer la plateforme et décider quel forfait vous convient le mieux.",
  },
  whatThisMeans: 'Ce que cela signifie',
  freePlanFeatures: [
    'Créez jusqu\'à 5 sondages par mois',
    'Accès à tous les types de questions de base',
    'Analyses et rapports de base',
    'Parfait pour un usage personnel et les petits projets',
  ],
  proPlanFeatures: [
    'Sondages illimités',
    'Créez et gérez des organisations',
    'Invitez des membres d\'équipe à collaborer',
    'Analyses avancées et options d\'export',
    'Support prioritaire',
  ],
  nextSteps:
    'Aucune action n\'est requise pour le moment. Continuez à utiliser la plateforme comme d\'habitude. Si vous avez une période de grâce, vous pouvez explorer toutes les fonctionnalités Pro avant de prendre une décision.',
  viewPlans: 'Voir tous les forfaits',
  questions:
    'Des questions sur les nouveaux forfaits ? N\'hésitez pas à répondre à cet e-mail ou à contacter notre équipe d\'assistance.',
  thankYou: 'Merci de faire partie de notre communauté !',
  team: 'L\'équipe de la plateforme de sondage',
};

// Styles
const graceNoticeStyle: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  padding: '16px',
  borderRadius: '6px',
  borderLeft: '4px solid #f59e0b',
};

const listStyle: React.CSSProperties = {
  margin: '0 0 16px 0',
  paddingLeft: '24px',
};

const listItemStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#334155',
  lineHeight: '1.6',
  marginBottom: '8px',
};
