// This file is for the React Email preview server only
// The actual template is in lib/email-templates/SubscriptionMigrationEmail.tsx

import { SubscriptionMigrationEmail } from '../lib/email-templates/SubscriptionMigrationEmail';

// English preview - Free Plan
export default function SubscriptionMigrationEmailPreview() {
  return (
    <SubscriptionMigrationEmail
      userName="John Doe"
      assignedPlan="Free"
      hasGracePeriod={false}
      pricingUrl="https://survey.fatihoune.com/pricing"
      locale="en"
    />
  );
}

// English preview - Pro Plan with Grace Period
export function SubscriptionMigrationEmailProGrace() {
  return (
    <SubscriptionMigrationEmail
      userName="Jane Smith"
      assignedPlan="Pro"
      hasGracePeriod={true}
      graceEndDate="December 5, 2025"
      pricingUrl="https://survey.fatihoune.com/pricing"
      locale="en"
    />
  );
}

// French preview - Free Plan
export function SubscriptionMigrationEmailPreviewFR() {
  return (
    <SubscriptionMigrationEmail
      userName="Jean Dupont"
      assignedPlan="Free"
      hasGracePeriod={false}
      pricingUrl="https://survey.fatihoune.com/pricing"
      locale="fr"
    />
  );
}

// French preview - Pro Plan with Grace Period
export function SubscriptionMigrationEmailProGraceFR() {
  return (
    <SubscriptionMigrationEmail
      userName="Marie Dubois"
      assignedPlan="Pro"
      hasGracePeriod={true}
      graceEndDate="5 décembre 2025"
      pricingUrl="https://survey.fatihoune.com/pricing"
      locale="fr"
    />
  );
}
