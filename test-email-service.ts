/**
 * Test script for email service
 *
 * This script tests the email service in development mode.
 * Run with: pnpm tsx test-email-service.ts
 */

import { sendEmail } from './lib/services/email-service';
import { TestEmail } from './lib/email-templates/TestEmail';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Send test email in English
  console.log('Test 1: Sending test email (English)');
  const result1 = await sendEmail({
    to: 'john.doe@example.com',
    subject: 'Test Email from Survey Platform',
    react: TestEmail({ name: 'John Doe', locale: 'en' }),
  });
  console.log('Result:', result1);
  console.log('');

  // Test 2: Send test email in French
  console.log('Test 2: Sending test email (French)');
  const result2 = await sendEmail({
    to: 'jean.dupont@example.com',
    subject: 'Email de test de la plateforme de sondage',
    react: TestEmail({ name: 'Jean Dupont', locale: 'fr' }),
  });
  console.log('Result:', result2);
  console.log('');

  // Test 3: Send to multiple recipients
  console.log('Test 3: Sending to multiple recipients');
  const result3 = await sendEmail({
    to: ['user1@example.com', 'user2@example.com'],
    subject: 'Bulk Test Email',
    react: TestEmail({ name: 'Team', locale: 'en' }),
  });
  console.log('Result:', result3);
  console.log('');

  console.log('✅ All tests completed!');
  console.log('\nNote: In development mode, emails are logged to console instead of being sent.');
  console.log('To test actual sending, set NODE_ENV=production and configure RESEND_API_KEY.');
}

testEmailService().catch(console.error);
