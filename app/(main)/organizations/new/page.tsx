import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { checkOrganizationLimit } from '@/lib/utils/subscription-limits';

export default async function NewOrganizationPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((mod) => mod.headers()),
  });

  if (!session) {
    redirect('/login');
  }

  // Check organization limit
  const limitCheck = await checkOrganizationLimit(session.user.id);

  // Free users: redirect to pricing
  if (!limitCheck.allowed && limitCheck.reason === 'organization_upgrade_required') {
    redirect('/pricing?reason=organization_upgrade_required');
  }

  // Pro users at limit: redirect to pricing
  if (!limitCheck.allowed && limitCheck.reason === 'organization_limit_reached') {
    redirect('/pricing?reason=organization_limit_reached');
  }

  // If allowed, redirect to organizations page where they can create
  redirect('/organizations');
}
