/**
 * Rollback Script: Revert Subscription Plan Migration
 *
 * This script reverses the subscription plan migration by:
 * - Removing all user subscriptions
 * - Resetting user currentPlanId to null
 * - Preserving usage tracking data (for audit purposes)
 *
 * ⚠️  WARNING: This is a destructive operation. Use with caution!
 *
 * Usage:
 *   npx tsx scripts/rollback-subscription-migration.ts
 *
 * Environment:
 *   DATABASE_URL - PostgreSQL connection string
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface RollbackResult {
  subscriptionsDeleted: number;
  usersUpdated: number;
  errors: string[];
}

/**
 * Prompt user for confirmation before proceeding with rollback
 */
async function confirmRollback(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will delete all subscriptions and reset user plans.\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

/**
 * Main rollback function
 */
async function rollbackMigration(): Promise<RollbackResult> {
  const result: RollbackResult = {
    subscriptionsDeleted: 0,
    usersUpdated: 0,
    errors: [],
  };

  console.log('🔄 Starting subscription plan migration rollback...\n');

  try {
    // ============================================
    // STEP 1: Fetch Current State
    // ============================================
    console.log('📊 Step 1: Checking current state...');

    const subscriptionCount = await prisma.subscription.count();
    const usersWithPlans = await prisma.user.count({
      where: {
        currentPlanId: { not: null },
      },
    });

    console.log(`Found ${subscriptionCount} subscriptions`);
    console.log(`Found ${usersWithPlans} users with assigned plans\n`);

    if (subscriptionCount === 0 && usersWithPlans === 0) {
      console.log('✅ No subscriptions or plans found. Nothing to rollback.');
      return result;
    }

    // ============================================
    // STEP 2: Confirm Rollback
    // ============================================
    const confirmed = await confirmRollback();

    if (!confirmed) {
      console.log('\n❌ Rollback cancelled by user.');
      process.exit(0);
    }

    console.log('\n✅ Proceeding with rollback...\n');

    // ============================================
    // STEP 3: Delete All Subscriptions
    // ============================================
    console.log('🗑️  Step 3: Deleting subscriptions...');

    const deletedSubscriptions = await prisma.subscription.deleteMany({});
    result.subscriptionsDeleted = deletedSubscriptions.count;

    console.log(`✅ Deleted ${deletedSubscriptions.count} subscriptions\n`);

    // ============================================
    // STEP 4: Reset User Plans
    // ============================================
    console.log('🔄 Step 4: Resetting user plans...');

    const updatedUsers = await prisma.user.updateMany({
      where: {
        currentPlanId: { not: null },
      },
      data: {
        currentPlanId: null,
      },
    });
    result.usersUpdated = updatedUsers.count;

    console.log(`✅ Reset plans for ${updatedUsers.count} users\n`);

    // ============================================
    // STEP 5: Verify Rollback
    // ============================================
    console.log('✅ Step 5: Verifying rollback...');

    const remainingSubscriptions = await prisma.subscription.count();
    const remainingUsersWithPlans = await prisma.user.count({
      where: {
        currentPlanId: { not: null },
      },
    });

    if (remainingSubscriptions > 0 || remainingUsersWithPlans > 0) {
      throw new Error(
        `Rollback incomplete: ${remainingSubscriptions} subscriptions and ${remainingUsersWithPlans} users with plans still exist`
      );
    }

    console.log('✅ Rollback verification passed\n');

    // ============================================
    // STEP 6: Summary Report
    // ============================================
    console.log('📊 Rollback Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Subscriptions Deleted:  ${result.subscriptionsDeleted}`);
    console.log(`Users Updated:          ${result.usersUpdated}`);
    console.log(`Errors:                 ${result.errors.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      result.errors.forEach(err => console.log(`   - ${err}`));
      console.log('');
    }

    console.log('✅ Rollback completed successfully!\n');

    console.log('ℹ️  Note: Usage tracking data has been preserved for audit purposes.');
    console.log('ℹ️  To re-run the migration, use: npx tsx scripts/migrate-users-to-subscription-plans.ts\n');

  } catch (error) {
    console.error('❌ Fatal error during rollback:', error);
    throw error;
  }

  return result;
}

/**
 * Script entry point
 */
async function main() {
  try {
    await rollbackMigration();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run rollback if called directly
if (require.main === module) {
  main();
}

export { rollbackMigration };
