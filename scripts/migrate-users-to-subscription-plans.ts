/**
 * Migration Script: Assign Subscription Plans to Existing Users
 *
 * This script migrates existing users to the new subscription tier system:
 * - Users with organizations: Pro plan + 30-day grace period
 * - Users without organizations: Free plan
 * - Sends migration announcement emails to all users (EN/FR)
 *
 * Usage:
 *   npx tsx scripts/migrate-users-to-subscription-plans.ts
 *
 * Environment:
 *   DATABASE_URL - PostgreSQL connection string
 *   RESEND_API_KEY - Resend API key for sending emails
 *   FROM_EMAIL - Email sender address
 */

import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../lib/services/email-service';
import { SubscriptionMigrationEmail } from '../lib/email-templates/SubscriptionMigrationEmail';
import React from 'react';

const prisma = new PrismaClient();

interface MigrationResult {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

/**
 * Calculate the grace period end date (30 days from now)
 */
function getGraceEndDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

/**
 * Detect user's preferred locale based on email domain or default to 'en'
 */
function detectUserLocale(email: string): 'en' | 'fr' {
  // Simple heuristic: .fr domains or common French email providers
  const frenchDomains = ['.fr', '@orange.fr', '@free.fr', '@sfr.fr', '@wanadoo.fr'];
  const isFrench = frenchDomains.some(domain => email.toLowerCase().includes(domain));
  return isFrench ? 'fr' : 'en';
}

/**
 * Main migration function
 */
async function migratePlans(): Promise<MigrationResult> {
  const result: MigrationResult = {
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    emailsSent: 0,
    emailsFailed: 0,
    errors: [],
  };

  console.log('🚀 Starting subscription plan migration...\n');

  try {
    // ============================================
    // STEP 1: Get or Create Subscription Plans
    // ============================================
    console.log('📋 Step 1: Ensuring subscription plans exist...');

    const freePlan = await prisma.subscriptionPlan.upsert({
      where: { name_currency: { name: 'Free', currency: 'USD' } },
      update: {},
      create: {
        name: 'Free',
        description: 'Basic features for personal use',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: JSON.stringify([
          'Up to 5 surveys per month',
          'Basic question types',
          'Basic analytics',
          '100 responses per survey',
        ]),
        isActive: true,
        limits: {
          create: [
            { limitType: 'surveys', limitValue: '5' },
            { limitType: 'organizations', limitValue: '0' },
            { limitType: 'users', limitValue: '1' },
          ],
        },
      },
    });

    const proPlan = await prisma.subscriptionPlan.upsert({
      where: { name_currency: { name: 'Pro', currency: 'USD' } },
      update: {},
      create: {
        name: 'Pro',
        description: 'Advanced features for teams and organizations',
        price: 2900, // $29.00
        currency: 'USD',
        interval: 'month',
        features: JSON.stringify([
          'Unlimited surveys',
          'Organizations',
          'Team collaboration',
          'Advanced analytics',
          'Priority support',
        ]),
        isActive: true,
        limits: {
          create: [
            { limitType: 'surveys', limitValue: 'unlimited' },
            { limitType: 'organizations', limitValue: '3' },
            { limitType: 'users', limitValue: '10' },
          ],
        },
      },
    });

    console.log(`✅ Plans ready: Free (${freePlan.id}), Pro (${proPlan.id})\n`);

    // ============================================
    // STEP 2: Fetch All Users
    // ============================================
    console.log('👥 Step 2: Fetching all users...');

    const users = await prisma.user.findMany({
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        subscriptions: true,
      },
    });

    result.totalUsers = users.length;
    console.log(`Found ${users.length} users to migrate\n`);

    // ============================================
    // STEP 3: Migrate Each User
    // ============================================
    console.log('🔄 Step 3: Migrating users to subscription plans...\n');

    const graceEndDate = getGraceEndDate();
    const graceEndDateFormatted = graceEndDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const graceEndDateFormattedFR = graceEndDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (const user of users) {
      try {
        // Skip if user already has a subscription
        if (user.subscriptions.length > 0) {
          console.log(`⏭️  Skipping ${user.email} - already has subscription`);
          continue;
        }

        // Determine plan based on organization membership
        const hasOrganization = user.organizationMembers.length > 0;
        const assignedPlan = hasOrganization ? proPlan : freePlan;
        const planName = assignedPlan.name as 'Free' | 'Pro';

        console.log(`📝 Migrating ${user.email} → ${planName} plan`);

        // Create subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: assignedPlan.id,
            status: 'active',
            paymentProvider: 'stripe', // Default provider
            graceEndsAt: hasOrganization ? graceEndDate : null,
          },
        });

        // Update user's current plan
        await prisma.user.update({
          where: { id: user.id },
          data: { currentPlanId: assignedPlan.id },
        });

        // Update counters
        if (hasOrganization) {
          result.proUsers++;
        } else {
          result.freeUsers++;
        }

        // Send migration email
        const locale = detectUserLocale(user.email);
        const formattedDate = locale === 'fr' ? graceEndDateFormattedFR : graceEndDateFormatted;

        const emailResult = await sendEmail({
          to: user.email,
          subject: locale === 'en'
            ? 'Important Update: New Subscription Plans'
            : 'Mise à jour importante : Nouveaux forfaits d\'abonnement',
          react: React.createElement(SubscriptionMigrationEmail, {
            userName: user.name,
            assignedPlan: planName,
            hasGracePeriod: hasOrganization,
            graceEndDate: hasOrganization ? formattedDate : undefined,
            pricingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
            locale,
          }),
        });

        if (emailResult.success) {
          result.emailsSent++;
          console.log(`   ✉️  Email sent to ${user.email}`);
        } else {
          result.emailsFailed++;
          result.errors.push(`Failed to send email to ${user.email}: ${emailResult.error}`);
          console.log(`   ❌ Email failed: ${emailResult.error}`);
        }

      } catch (error) {
        const errorMsg = `Error migrating user ${user.email}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }

    console.log('\n✅ Migration completed!\n');

    // ============================================
    // STEP 4: Summary Report
    // ============================================
    console.log('📊 Migration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Users:          ${result.totalUsers}`);
    console.log(`Free Plan Users:      ${result.freeUsers}`);
    console.log(`Pro Plan Users:       ${result.proUsers} (with 30-day grace period)`);
    console.log(`Emails Sent:          ${result.emailsSent}`);
    console.log(`Emails Failed:        ${result.emailsFailed}`);
    console.log(`Errors:               ${result.errors.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      result.errors.forEach(err => console.log(`   - ${err}`));
      console.log('');
    }

    console.log(`🎁 Grace Period: ${graceEndDateFormatted}`);
    console.log('   Pro users have full access until this date\n');

  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    throw error;
  }

  return result;
}

/**
 * Script entry point
 */
async function main() {
  try {
    await migratePlans();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

export { migratePlans };
