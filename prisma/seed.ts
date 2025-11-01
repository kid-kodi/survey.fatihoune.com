import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users with better-auth accounts
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      updatedAt: new Date(),
      Account: {
        create: {
          id: 'test-account-1',
          accountId: 'test@example.com',
          providerId: 'credential',
          password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password"
          updatedAt: new Date(),
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'test-user-2',
      email: 'demo@example.com',
      name: 'Demo User',
      emailVerified: true,
      updatedAt: new Date(),
      Account: {
        create: {
          id: 'test-account-2',
          accountId: 'demo@example.com',
          providerId: 'credential',
          password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password"
          updatedAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Created users:', { user1: user1.email, user2: user2.email });

  // Create test survey for user1
  const survey1 = await prisma.survey.upsert({
    where: { id: 'test-survey-1' },
    update: {},
    create: {
      id: 'test-survey-1',
      userId: user1.id,
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our services by sharing your feedback',
      status: 'published',
      publishedAt: new Date(),
    },
  });

  // Create questions for the survey
  await prisma.question.create({
    data: {
      surveyId: survey1.id,
      type: 'rating_scale',
      text: 'How satisfied are you with our service?',
      options: {
        min: 1,
        max: 5,
        minLabel: 'Very Unsatisfied',
        maxLabel: 'Very Satisfied',
      },
      required: true,
      order: 0,
    },
  });

  await prisma.question.create({
    data: {
      surveyId: survey1.id,
      type: 'multiple_choice',
      text: 'How did you hear about us?',
      options: {
        choices: ['Google Search', 'Social Media', 'Friend/Family', 'Advertisement', 'Other'],
      },
      required: true,
      order: 1,
    },
  });

  await prisma.question.create({
    data: {
      surveyId: survey1.id,
      type: 'text_input',
      text: 'What can we do to improve?',
      options: {
        placeholder: 'Share your suggestions...',
        maxLength: 500,
      },
      required: false,
      order: 2,
    },
  });

  console.log('✅ Created survey:', survey1.title);

  // Create a draft survey for user2
  const survey2 = await prisma.survey.create({
    data: {
      userId: user2.id,
      title: 'Employee Engagement Survey',
      description: 'Annual employee satisfaction and engagement survey',
      status: 'draft',
    },
  });

  console.log('✅ Created draft survey:', survey2.title);

  // Create sample responses for published survey
  await prisma.response.create({
    data: {
      surveyId: survey1.id,
      answers: [
        { questionId: 'q1', answer: 5 },
        { questionId: 'q2', answer: 'Google Search' },
        { questionId: 'q3', answer: 'Great service, keep it up!' },
      ],
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  await prisma.response.create({
    data: {
      surveyId: survey1.id,
      answers: [
        { questionId: 'q1', answer: 4 },
        { questionId: 'q2', answer: 'Social Media' },
        { questionId: 'q3', answer: 'More features would be nice' },
      ],
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  console.log('✅ Created 2 sample responses');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
