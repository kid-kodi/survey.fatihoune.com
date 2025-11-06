// This file is for the React Email preview server only
// The actual template is in lib/email-templates/OrganizationInvitationEmail.tsx

import { OrganizationInvitationEmail } from '../lib/email-templates/OrganizationInvitationEmail';

// English preview
export default function OrganizationInvitationEmailPreview() {
  return (
    <OrganizationInvitationEmail
      inviteeName="john.doe@example.com"
      inviterName="Sarah Johnson"
      organizationName="Acme Corporation"
      roleName="Admin"
      invitationUrl="https://survey.fatihoune.com/invitations/abc123token"
      declineUrl="https://survey.fatihoune.com/invitations/abc123token/decline"
      expiresInDays={7}
      locale="en"
    />
  );
}

// French preview
export function OrganizationInvitationEmailPreviewFR() {
  return (
    <OrganizationInvitationEmail
      inviteeName="jean.dupont@exemple.fr"
      inviterName="Sarah Johnson"
      organizationName="Société Acme"
      roleName="Administrateur"
      invitationUrl="https://survey.fatihoune.com/invitations/abc123token"
      declineUrl="https://survey.fatihoune.com/invitations/abc123token/decline"
      expiresInDays={7}
      locale="fr"
    />
  );
}
