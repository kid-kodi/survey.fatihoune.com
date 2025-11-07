import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // STEP 1: Create a default organization for system roles
  // ============================================
  console.log('\n🏢 Creating default organization...');

  const systemOrg = await prisma.organization.upsert({
    where: {
      slug: 'system'
    },
    update: {},
    create: {
      name: 'System',
      slug: 'system',
      description: 'Default organization for system roles'
    }
  });

  // ============================================
  // STEP 2: Seed System Permissions
  // ============================================
  console.log('\n📋 Creating system permissions...');

  const permissions = [
    // Organization permissions
    {
      name: 'manage_organization',
      description: 'Edit organization settings and delete organization',
      category: 'organization',
    },
    {
      name: 'manage_users',
      description: 'Invite, remove, and change roles of organization members',
      category: 'organization',
    },
    {
      name: 'manage_roles',
      description: 'Create, edit, and delete custom roles',
      category: 'organization',
    },
    // Survey permissions
    {
      name: 'create_surveys',
      description: 'Create new surveys in the organization',
      category: 'surveys',
    },
    {
      name: 'manage_all_surveys',
      description: 'Edit and delete all organization surveys',
      category: 'surveys',
    },
    {
      name: 'manage_own_surveys',
      description: 'Edit and delete only surveys you created',
      category: 'surveys',
    },
    // Analytics permissions
    {
      name: 'view_all_analytics',
      description: 'View analytics for all organization surveys',
      category: 'analytics',
    },
    {
      name: 'view_own_analytics',
      description: 'View analytics only for surveys you created',
      category: 'analytics',
    },
    // Data permissions
    {
      name: 'export_data',
      description: 'Export survey responses to CSV',
      category: 'data',
    },
  ];

  const createdPermissions: Record<string, any> = {};

  for (const permission of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
    createdPermissions[permission.name] = created;
    console.log(`  ✓ ${permission.name}`);
  }

  console.log(`✅ Created ${Object.keys(createdPermissions).length} permissions`);

  // ============================================
  // STEP 3: Seed System Roles
  // ============================================
  console.log('\n👥 Creating system roles...');

  // Owner Role (all permissions)
  const ownerRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: systemOrg.id,
        name: 'Owner',
      },
    },
    update: {},
    create: {
      name: 'Owner',
      description: 'Full access to all organization features',
      isSystemRole: true,
      organizationId: systemOrg.id,
    },
  });

  // Assign all permissions to Owner
  for (const permissionName of Object.keys(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: ownerRole.id,
          permissionId: createdPermissions[permissionName].id,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        permissionId: createdPermissions[permissionName].id,
      },
    });
  }
  console.log(`  ✓ Owner (${Object.keys(createdPermissions).length} permissions)`);

  // Admin Role (all except manage_organization)
  const adminRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: systemOrg.id,
        name: 'Admin',
      },
    },
    update: {},
    create: {
      name: 'Admin',
      description: 'Manage surveys, users, and analytics',
      isSystemRole: true,
      organizationId: systemOrg.id,
    },
  });

  const adminPermissions = [
    'manage_users',
    'manage_roles',
    'create_surveys',
    'manage_all_surveys',
    'view_all_analytics',
    'export_data',
  ];

  for (const permissionName of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: createdPermissions[permissionName].id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: createdPermissions[permissionName].id,
      },
    });
  }
  console.log(`  ✓ Admin (${adminPermissions.length} permissions)`);

  // Agent Role (create and manage own surveys)
  const agentRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: systemOrg.id,
        name: 'Agent',
      },
    },
    update: {},
    create: {
      name: 'Agent',
      description: 'Create and manage own surveys',
      isSystemRole: true,
      organizationId: systemOrg.id,
    },
  });

  const agentPermissions = ['create_surveys', 'manage_own_surveys', 'view_own_analytics'];

  for (const permissionName of agentPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: agentRole.id,
          permissionId: createdPermissions[permissionName].id,
        },
      },
      update: {},
      create: {
        roleId: agentRole.id,
        permissionId: createdPermissions[permissionName].id,
      },
    });
  }
  console.log(`  ✓ Agent (${agentPermissions.length} permissions)`);

  console.log('✅ Created 3 system roles');

  // ============================================
  // STEP 4: Create test users with better-auth accounts
  // ============================================
  console.log('\n👤 Creating test users...');

  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      updatedAt: new Date(),
      accounts: {
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
      accounts: {
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

  // ============================================
  // STEP 5: Assign users to organization with roles
  // ============================================
  console.log('\n🔗 Assigning users to organization...');

  // Add user1 as Owner in the system organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: systemOrg.id,
        userId: user1.id,
      },
    },
    update: {},
    create: {
      organizationId: systemOrg.id,
      userId: user1.id,
      roleId: ownerRole.id,
    },
  });

  // Add user2 as Agent in the system organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: systemOrg.id,
        userId: user2.id,
      },
    },
    update: {},
    create: {
      organizationId: systemOrg.id,
      userId: user2.id,
      roleId: agentRole.id,
    },
  });

  console.log('✅ Users assigned to organization with roles');

  // ============================================
  // STEP 6: Create test surveys
  // ============================================
  console.log('\n📊 Creating test surveys...');

  // Create test survey for user1
  const survey1 = await prisma.survey.upsert({
    where: { id: 'test-survey-1' },
    update: {},
    create: {
      id: 'test-survey-1',
      userId: user1.id,
      organizationId: systemOrg.id,
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
      organizationId: systemOrg.id,
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

  // ============================================
  // STEP 7: Seed Subscription Plans
  // ============================================
  console.log('\n💳 Creating subscription plans...');

  // Free Plan (USD) - Default for all users
  const freePlanUSD = await prisma.subscriptionPlan.upsert({
    where: {
      name_currency: {
        name: 'Free',
        currency: 'USD'
      }
    },
    update: {},
    create: {
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        '5 surveys',
        'Basic analytics',
        'CSV export',
        'Email support'
      ],
      isActive: true,
    },
  });
  console.log('  ✓ Free Plan (USD)');

  // Pro Plan (USD - via Stripe)
  const proPlanUSD = await prisma.subscriptionPlan.upsert({
    where: {
      name_currency: {
        name: 'Pro',
        currency: 'USD'
      }
    },
    update: {},
    create: {
      name: 'Pro',
      description: 'For growing teams',
      price: 2900, // $29.00 in cents
      currency: 'USD',
      interval: 'month',
      stripeProductId: 'prod_XXX', // Replace with actual Stripe product ID
      stripePriceId: 'price_XXX',
      features: [
        '1 organization',
        '5 team members',
        '10 surveys per user (50 max)',
        'Advanced analytics',
        'Priority support'
      ],
      isActive: true,
    },
  });
  console.log('  ✓ Pro Plan (USD)');

  // Pro Plan (XOF - via Wave/Orange Money)
  const proPlanXOF = await prisma.subscriptionPlan.upsert({
    where: {
      name_currency: {
        name: 'Pro',
        currency: 'XOF'
      }
    },
    update: {},
    create: {
      name: 'Pro',
      description: 'Pour les équipes en croissance',
      price: 1500000, // 15,000 FCFA (stored in centimes)
      currency: 'XOF',
      interval: 'month',
      waveProductId: 'wave_prod_XXX',
      orangeProductId: 'orange_prod_XXX',
      features: [
        '1 organisation',
        '5 membres',
        '10 sondages par utilisateur (50 max)',
        'Analyses avancées',
        'Support prioritaire'
      ],
      isActive: true,
    },
  });
  console.log('  ✓ Pro Plan (XOF/CFA Franc)');

  // Premium Plan (USD - via Stripe)
  const premiumPlanUSD = await prisma.subscriptionPlan.upsert({
    where: {
      name_currency: {
        name: 'Premium',
        currency: 'USD'
      }
    },
    update: {},
    create: {
      name: 'Premium',
      description: 'For large organizations',
      price: 9900, // $99.00 in cents
      currency: 'USD',
      interval: 'month',
      stripeProductId: 'prod_YYY',
      stripePriceId: 'price_YYY',
      features: [
        'Unlimited organizations',
        'Unlimited members',
        'Unlimited surveys',
        'Custom branding',
        'API access',
        'Dedicated support'
      ],
      isActive: true,
    },
  });
  console.log('  ✓ Premium Plan (USD)');

  // Premium Plan (XOF - via Wave/Orange Money)
  const premiumPlanXOF = await prisma.subscriptionPlan.upsert({
    where: {
      name_currency: {
        name: 'Premium',
        currency: 'XOF'
      }
    },
    update: {},
    create: {
      name: 'Premium',
      description: 'Pour les grandes organisations',
      price: 5000000, // 50,000 FCFA (stored in centimes)
      currency: 'XOF',
      interval: 'month',
      waveProductId: 'wave_prod_YYY',
      orangeProductId: 'orange_prod_YYY',
      features: [
        'Organisations illimitées',
        'Membres illimités',
        'Sondages illimités',
        'Image de marque personnalisée',
        "Accès à l'API",
        'Support dédié'
      ],
      isActive: true,
    },
  });
  console.log('  ✓ Premium Plan (XOF/CFA Franc)');

  // Custom Plan
  const customPlan = await prisma.subscriptionPlan.upsert({
    where: {
      name_currency: {
        name: 'Custom',
        currency: 'USD'
      }
    },
    update: {},
    create: {
      name: 'Custom',
      description: 'Enterprise solution',
      price: 0, // Contact for pricing
      currency: 'USD',
      interval: 'month',
      features: [
        'Everything in Premium',
        'Custom contracts',
        'SSO/SAML',
        'Dedicated account manager',
        'SLA guarantees'
      ],
      isActive: true,
    },
  });
  console.log('  ✓ Custom Plan');

  console.log('✅ Created 6 subscription plans');

  // ============================================
  // STEP 8: Seed Plan Limits
  // ============================================
  console.log('\n📏 Creating plan limits...');

  // Free Plan Limits
  await prisma.planLimit.createMany({
    data: [
      { planId: freePlanUSD.id, limitType: 'surveys', limitValue: '5' },
      { planId: freePlanUSD.id, limitType: 'organizations', limitValue: '0' },
      { planId: freePlanUSD.id, limitType: 'users', limitValue: '1' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Free Plan limits');

  // Pro Plan Limits (USD and XOF have same limits)
  await prisma.planLimit.createMany({
    data: [
      { planId: proPlanUSD.id, limitType: 'surveys', limitValue: '50' },
      { planId: proPlanUSD.id, limitType: 'organizations', limitValue: '1' },
      { planId: proPlanUSD.id, limitType: 'users', limitValue: '5' },
      { planId: proPlanXOF.id, limitType: 'surveys', limitValue: '50' },
      { planId: proPlanXOF.id, limitType: 'organizations', limitValue: '1' },
      { planId: proPlanXOF.id, limitType: 'users', limitValue: '5' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Pro Plan limits');

  // Premium Plan Limits (unlimited)
  await prisma.planLimit.createMany({
    data: [
      { planId: premiumPlanUSD.id, limitType: 'surveys', limitValue: 'unlimited' },
      { planId: premiumPlanUSD.id, limitType: 'organizations', limitValue: 'unlimited' },
      { planId: premiumPlanUSD.id, limitType: 'users', limitValue: 'unlimited' },
      { planId: premiumPlanXOF.id, limitType: 'surveys', limitValue: 'unlimited' },
      { planId: premiumPlanXOF.id, limitType: 'organizations', limitValue: 'unlimited' },
      { planId: premiumPlanXOF.id, limitType: 'users', limitValue: 'unlimited' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Premium Plan limits');

  // Custom Plan Limits (unlimited)
  await prisma.planLimit.createMany({
    data: [
      { planId: customPlan.id, limitType: 'surveys', limitValue: 'unlimited' },
      { planId: customPlan.id, limitType: 'organizations', limitValue: 'unlimited' },
      { planId: customPlan.id, limitType: 'users', limitValue: 'unlimited' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓ Custom Plan limits');

  console.log('✅ Created plan limits for all subscription tiers');

  // ============================================
  // STEP 9: Assign Free Plan to Test Users
  // ============================================
  console.log('\n🎁 Assigning Free plan to test users...');

  await prisma.user.update({
    where: { id: user1.id },
    data: { currentPlanId: freePlanUSD.id },
  });

  await prisma.user.update({
    where: { id: user2.id },
    data: { currentPlanId: freePlanUSD.id },
  });

  console.log('✅ Test users assigned to Free plan');

  // ============================================
  // STEP 10: Create System Administrator User
  // ============================================
  console.log('\n👑 Creating System Administrator...');

  // Check if sys_admin already exists
  const existingSysAdmin = await prisma.user.findFirst({
    where: { isSysAdmin: true },
  });

  if (existingSysAdmin) {
    console.log('⚠️  sys_admin user already exists:', existingSysAdmin.email);
  } else {
    // Create sys_admin user
    const sysAdmin = await prisma.user.create({
      data: {
        id: 'sys-admin-1',
        email: 'admin@survey.fatihoune.com',
        name: 'System Administrator',
        emailVerified: true,
        isSysAdmin: true,
        updatedAt: new Date(),
        accounts: {
          create: {
            id: 'sys-admin-account-1',
            accountId: 'admin@survey.fatihoune.com',
            providerId: 'credential',
            password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password"
            updatedAt: new Date(),
          },
        },
      },
    });

    console.log('✅ Created sys_admin user:', sysAdmin.email);
    console.log('📧 Email: admin@survey.fatihoune.com');
    console.log('🔑 Default password: password');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
  }

  // ============================================
  // STEP 11: Seed Blog Posts
  // ============================================
  console.log('\n📝 Creating blog posts...');

  // Get the sys_admin user for blog post authorship
  const blogAuthor = existingSysAdmin || await prisma.user.findFirst({
    where: { isSysAdmin: true },
  });

  if (!blogAuthor) {
    console.log('⚠️  No sys_admin user found. Skipping blog post creation.');
  } else {
    // Blog Post 1: 5 Best Practices for Creating Effective Surveys
    await prisma.blogPost.upsert({
      where: { slug: '5-best-practices-for-creating-effective-surveys' },
      update: {},
      create: {
        title: '5 Best Practices for Creating Effective Surveys',
        slug: '5-best-practices-for-creating-effective-surveys',
        excerpt: 'Learn the essential techniques to create surveys that gather valuable insights and achieve high response rates.',
        content: `# 5 Best Practices for Creating Effective Surveys

Creating an effective survey isn't just about asking questions—it's about asking the *right* questions in the *right* way. Here are five proven practices to help you design surveys that collect meaningful data and respect your respondents' time.

## 1. Keep It Short (5-10 Questions Max)

**Less is more** when it comes to surveys. Research shows that response rates drop significantly after 10 questions, and completion rates plummet for surveys longer than 5 minutes.

**Why it matters:**
- Higher completion rates
- Better quality responses
- More engaged participants

**Pro tip:** Ask yourself, "Do I *really* need this data?" for every question. If you can't articulate how you'll use the answer, cut the question.

## 2. Use Clear, Unbiased Language

Avoid jargon, double negatives, and leading questions. Your language should be simple, direct, and neutral.

**Bad example:**
"Don't you agree that our amazing new product is better than competitors?"

**Good example:**
"How would you rate our product compared to similar products you've used?"

**Remember:** A confused respondent is a lost respondent. If a question requires explanation, it's too complex.

## 3. Offer a Mix of Question Types

Variety keeps respondents engaged and gives you richer data. Use a combination of:

- **Multiple choice** for clear options
- **Rating scales** for opinions and satisfaction
- **Yes/No** for simple binary decisions
- **Open-ended text** for detailed feedback (use sparingly!)

**Balance is key:** Too many open-ended questions exhaust respondents, while all multiple-choice can feel robotic.

## 4. Test Before Sending

**Always pilot test your survey** with 5-10 people before sending it to your full audience.

**What to test:**
- Are questions clear and unambiguous?
- Does the survey flow logically?
- Are there technical issues (broken logic, typos)?
- How long does it actually take to complete?

**Real example:** A client once discovered in testing that their "simple" survey was taking 15 minutes instead of the expected 5—and they cut it down before launch.

## 5. Provide Context and Purpose

People are more likely to complete your survey if they understand **why** it matters.

**Include:**
- A brief introduction explaining the survey's purpose
- How their responses will be used
- Estimated completion time
- Privacy/anonymity assurance

**Example opening:**
"Help us improve! This 5-minute survey helps us understand how to serve you better. Your responses are completely anonymous and will guide our product roadmap for 2024."

---

## Bonus Tip: Follow Up with Results

If appropriate, share what you learned and what actions you're taking based on survey feedback. This builds trust and increases participation in future surveys.

**Remember:** Every question should have a purpose, every word should be clear, and every survey should respect your audience's time. Follow these practices, and you'll see higher response rates and more valuable insights.

Ready to create your first survey? [Get started now](https://survey.fatihoune.com/register) with our easy-to-use survey builder!`,
        authorId: blogAuthor.id,
        publishedAt: new Date(),
        tags: ['surveys', 'best-practices', 'tips', 'survey-design'],
      },
    });
    console.log('  ✓ Blog Post 1: "5 Best Practices for Creating Effective Surveys"');

    // Blog Post 2: How to Increase Survey Response Rates
    await prisma.blogPost.upsert({
      where: { slug: 'how-to-increase-survey-response-rates' },
      update: {},
      create: {
        title: 'How to Increase Survey Response Rates',
        slug: 'how-to-increase-survey-response-rates',
        excerpt: 'Discover proven strategies to boost your survey response rates and collect more valuable feedback from your audience.',
        content: `# How to Increase Survey Response Rates

Getting people to complete your survey can be challenging. The average survey response rate is only 10-15%, but with the right strategies, you can significantly improve these numbers. Here's how.

## 1. Personalize Your Invitation

Generic, mass emails get ignored. Personalization makes respondents feel valued and increases engagement.

**What to personalize:**
- Use the recipient's name
- Reference their relationship with your organization
- Mention relevant context or previous interactions
- Send from a real person, not "noreply@company.com"

**Before:**
"Dear Customer, We'd like your feedback..."

**After:**
"Hi Sarah, As a valued customer who purchased our Premium plan last month, we'd love to hear..."

**Impact:** Studies show personalized invitations can increase response rates by **20-30%**.

## 2. Explain the Survey's Purpose

People want to know **why** they should spend time on your survey and **how** their input will be used.

**Be specific:**
- What decision are you trying to make?
- How will responses influence your product/service?
- What's the benefit to respondents?

**Example:**
"We're redesigning our dashboard based on user feedback. Your input will directly shape the features we prioritize in our Q2 release. This survey takes 3 minutes and will help us build the tools you actually need."

## 3. Keep It Short and Focused

We've said it before, but it bears repeating: **respect your respondents' time**.

**The numbers:**
- ✅ 5 questions: 80-90% completion rate
- ⚠️ 10 questions: 60-70% completion rate
- ❌ 20+ questions: 30-40% completion rate

**Action steps:**
- State the estimated time upfront (and be honest!)
- Show a progress indicator
- Remove "nice to know" questions—keep only "need to know"
- Consider splitting long surveys into multiple shorter ones

## 4. Mobile Optimization is Key

**Over 60% of surveys are now started on mobile devices**. If your survey isn't mobile-friendly, you're losing half your audience.

**Mobile best practices:**
- Use large, tap-friendly buttons
- Avoid long dropdown lists
- Minimize typing (use sliders, buttons, and selections)
- Test on multiple screen sizes
- Keep questions concise (even more than desktop!)

**Pro tip:** Send yourself a test and complete it on your phone. If it's frustrating, it needs work.

## 5. Offer Incentives (If Applicable)

Incentives can boost response rates, but they're not always necessary or appropriate.

**When incentives work:**
- Consumer research surveys
- Long or complex surveys (15+ minutes)
- Low engagement audiences
- Sensitive topics

**Effective incentive options:**
- Chance to win a prize (e.g., "$100 Amazon gift card raffle")
- Discount codes ("10% off your next purchase")
- Charitable donations ("$1 to charity for each response")
- Exclusive early access to features or products

**When NOT to offer incentives:**
- Employee engagement surveys (can feel manipulative)
- Highly engaged audiences (customers who love your product)
- Quick feedback requests (< 5 questions)

**Important:** Only use incentives that attract your target audience, not just anyone looking for freebies.

## 6. Time Your Send Strategically

**When you send matters** almost as much as what you send.

**Best practices:**
- **Avoid Mondays** (inbox overload) and **Fridays** (weekend mode)
- **Mid-morning (10-11 AM) or early afternoon (1-2 PM)** typically perform best
- **Avoid holidays and major events**
- Consider your audience's time zone

**B2B surveys:** Tuesday-Thursday, mid-morning
**Consumer surveys:** Weekday evenings or weekend mornings

## 7. Send Reminders (But Not Too Many)

Friendly reminders can double your response rate, but too many become spam.

**Optimal reminder strategy:**
- **First reminder:** 3-5 days after initial send
- **Second reminder:** 7-10 days after initial send
- **Final reminder:** 12-14 days (last chance!)

**Make it easy:** Exclude those who've already responded and acknowledge their time in the reminder.

**Example:**
"Just a quick reminder—we'd still love your feedback! If you've already completed our survey, thank you and please disregard this email."

---

## Putting It All Together

Increasing survey response rates isn't about tricks—it's about **respecting your audience**, being **clear about value**, and **removing friction**.

**Your action plan:**
1. Personalize your invitation
2. Clearly explain why their input matters
3. Keep it short (5-10 questions max)
4. Optimize for mobile
5. Time your send strategically
6. Send 1-2 friendly reminders

Follow these strategies, and you'll see your response rates climb while collecting higher-quality feedback.

**Ready to create a survey that people actually want to complete?** [Start building now](https://survey.fatihoune.com/register) with our mobile-optimized survey platform!`,
        authorId: blogAuthor.id,
        publishedAt: new Date(),
        tags: ['surveys', 'response-rates', 'engagement', 'best-practices', 'tips'],
      },
    });
    console.log('  ✓ Blog Post 2: "How to Increase Survey Response Rates"');

    console.log('✅ Created 2 blog posts');
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  • Organizations: 1 (System)`);
  console.log(`  • Permissions: ${Object.keys(createdPermissions).length}`);
  console.log('  • System Roles: 3 (Owner, Admin, Agent)');
  console.log('  • Test Users: 2');
  console.log('  • Organization Members: 2');
  console.log('  • Test Surveys: 2');
  console.log('  • Sample Responses: 2');
  console.log('  • Subscription Plans: 6 (Free, Pro-USD, Pro-XOF, Premium-USD, Premium-XOF, Custom)');
  console.log('  • Plan Limits: 15 (5 surveys for Free, 50 for Pro, unlimited for Premium/Custom)');
  console.log(`  • System Administrators: ${existingSysAdmin ? 1 : 1} (admin@survey.fatihoune.com)`);
  console.log(`  • Blog Posts: ${blogAuthor ? 2 : 0}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });