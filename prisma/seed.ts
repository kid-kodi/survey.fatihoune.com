// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database...');

//   // ============================================
//   // STEP 1: Seed System Permissions
//   // ============================================
//   console.log('\n📋 Creating system permissions...');

//   const permissions = [
//     // Organization permissions
//     {
//       name: 'manage_organization',
//       description: 'Edit organization settings and delete organization',
//       category: 'organization',
//     },
//     {
//       name: 'manage_users',
//       description: 'Invite, remove, and change roles of organization members',
//       category: 'organization',
//     },
//     {
//       name: 'manage_roles',
//       description: 'Create, edit, and delete custom roles',
//       category: 'organization',
//     },
//     // Survey permissions
//     {
//       name: 'create_surveys',
//       description: 'Create new surveys in the organization',
//       category: 'surveys',
//     },
//     {
//       name: 'manage_all_surveys',
//       description: 'Edit and delete all organization surveys',
//       category: 'surveys',
//     },
//     {
//       name: 'manage_own_surveys',
//       description: 'Edit and delete only surveys you created',
//       category: 'surveys',
//     },
//     // Analytics permissions
//     {
//       name: 'view_all_analytics',
//       description: 'View analytics for all organization surveys',
//       category: 'analytics',
//     },
//     {
//       name: 'view_own_analytics',
//       description: 'View analytics only for surveys you created',
//       category: 'analytics',
//     },
//     // Data permissions
//     {
//       name: 'export_data',
//       description: 'Export survey responses to CSV',
//       category: 'data',
//     },
//   ];

//   const createdPermissions: Record<string, any> = {};

//   for (const permission of permissions) {
//     const created = await prisma.permission.upsert({
//       where: { name: permission.name },
//       update: {},
//       create: permission,
//     });
//     createdPermissions[permission.name] = created;
//     console.log(`  ✓ ${permission.name}`);
//   }

//   console.log(`✅ Created ${Object.keys(createdPermissions).length} permissions`);

//   // ============================================
//   // STEP 2: Seed System Roles
//   // ============================================
//   console.log('\n👥 Creating system roles...');

//   // Owner Role (all permissions)
//   const ownerRole = await prisma.role.upsert({
//     where: {
//       organizationId_name: {
//         organizationId: null,
//         name: 'Owner',
//       },
//     },
//     update: {},
//     create: {
//       name: 'Owner',
//       description: 'Full access to all organization features',
//       isSystemRole: true,
//       organizationId: null,
//     },
//   });

//   // Assign all permissions to Owner
//   for (const permissionName of Object.keys(createdPermissions)) {
//     await prisma.rolePermission.upsert({
//       where: {
//         roleId_permissionId: {
//           roleId: ownerRole.id,
//           permissionId: createdPermissions[permissionName].id,
//         },
//       },
//       update: {},
//       create: {
//         roleId: ownerRole.id,
//         permissionId: createdPermissions[permissionName].id,
//       },
//     });
//   }
//   console.log(`  ✓ Owner (${Object.keys(createdPermissions).length} permissions)`);

//   // Admin Role (all except manage_organization)
//   const adminRole = await prisma.role.upsert({
//     where: {
//       organizationId_name: {
//         organizationId: null,
//         name: 'Admin',
//       },
//     },
//     update: {},
//     create: {
//       name: 'Admin',
//       description: 'Manage surveys, users, and analytics',
//       isSystemRole: true,
//       organizationId: null,
//     },
//   });

//   const adminPermissions = [
//     'manage_users',
//     'manage_roles',
//     'create_surveys',
//     'manage_all_surveys',
//     'view_all_analytics',
//     'export_data',
//   ];

//   for (const permissionName of adminPermissions) {
//     await prisma.rolePermission.upsert({
//       where: {
//         roleId_permissionId: {
//           roleId: adminRole.id,
//           permissionId: createdPermissions[permissionName].id,
//         },
//       },
//       update: {},
//       create: {
//         roleId: adminRole.id,
//         permissionId: createdPermissions[permissionName].id,
//       },
//     });
//   }
//   console.log(`  ✓ Admin (${adminPermissions.length} permissions)`);

//   // Agent Role (create and manage own surveys)
//   const agentRole = await prisma.role.upsert({
//     where: {
//       organizationId_name: {
//         organizationId: null,
//         name: 'Agent',
//       },
//     },
//     update: {},
//     create: {
//       name: 'Agent',
//       description: 'Create and manage own surveys',
//       isSystemRole: true,
//       organizationId: null,
//     },
//   });

//   const agentPermissions = ['create_surveys', 'manage_own_surveys', 'view_own_analytics'];

//   for (const permissionName of agentPermissions) {
//     await prisma.rolePermission.upsert({
//       where: {
//         roleId_permissionId: {
//           roleId: agentRole.id,
//           permissionId: createdPermissions[permissionName].id,
//         },
//       },
//       update: {},
//       create: {
//         roleId: agentRole.id,
//         permissionId: createdPermissions[permissionName].id,
//       },
//     });
//   }
//   console.log(`  ✓ Agent (${agentPermissions.length} permissions)`);

//   console.log('✅ Created 3 system roles');

//   // ============================================
//   // STEP 3: Create test users with better-auth accounts
//   // ============================================
//   console.log('\n👤 Creating test users...');
//   const user1 = await prisma.user.upsert({
//     where: { email: 'test@example.com' },
//     update: {},
//     create: {
//       id: 'test-user-1',
//       email: 'test@example.com',
//       name: 'Test User',
//       emailVerified: true,
//       updatedAt: new Date(),
//       accounts: {
//         create: {
//           id: 'test-account-1',
//           accountId: 'test@example.com',
//           providerId: 'credential',
//           password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password"
//           updatedAt: new Date(),
//         },
//       },
//     },
//   });

//   const user2 = await prisma.user.upsert({
//     where: { email: 'demo@example.com' },
//     update: {},
//     create: {
//       id: 'test-user-2',
//       email: 'demo@example.com',
//       name: 'Demo User',
//       emailVerified: true,
//       updatedAt: new Date(),
//       accounts: {
//         create: {
//           id: 'test-account-2',
//           accountId: 'demo@example.com',
//           providerId: 'credential',
//           password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // "password"
//           updatedAt: new Date(),
//         },
//       },
//     },
//   });

//   console.log('✅ Created users:', { user1: user1.email, user2: user2.email });

//   // Create test survey for user1
//   const survey1 = await prisma.survey.upsert({
//     where: { id: 'test-survey-1' },
//     update: {},
//     create: {
//       id: 'test-survey-1',
//       userId: user1.id,
//       title: 'Customer Satisfaction Survey',
//       description: 'Help us improve our services by sharing your feedback',
//       status: 'published',
//       publishedAt: new Date(),
//     },
//   });

//   // Create questions for the survey
//   await prisma.question.create({
//     data: {
//       surveyId: survey1.id,
//       type: 'rating_scale',
//       text: 'How satisfied are you with our service?',
//       options: {
//         min: 1,
//         max: 5,
//         minLabel: 'Very Unsatisfied',
//         maxLabel: 'Very Satisfied',
//       },
//       required: true,
//       order: 0,
//     },
//   });

//   await prisma.question.create({
//     data: {
//       surveyId: survey1.id,
//       type: 'multiple_choice',
//       text: 'How did you hear about us?',
//       options: {
//         choices: ['Google Search', 'Social Media', 'Friend/Family', 'Advertisement', 'Other'],
//       },
//       required: true,
//       order: 1,
//     },
//   });

//   await prisma.question.create({
//     data: {
//       surveyId: survey1.id,
//       type: 'text_input',
//       text: 'What can we do to improve?',
//       options: {
//         placeholder: 'Share your suggestions...',
//         maxLength: 500,
//       },
//       required: false,
//       order: 2,
//     },
//   });

//   console.log('✅ Created survey:', survey1.title);

//   // Create a draft survey for user2
//   const survey2 = await prisma.survey.create({
//     data: {
//       userId: user2.id,
//       title: 'Employee Engagement Survey',
//       description: 'Annual employee satisfaction and engagement survey',
//       status: 'draft',
//     },
//   });

//   console.log('✅ Created draft survey:', survey2.title);

//   // Create sample responses for published survey
//   await prisma.response.create({
//     data: {
//       surveyId: survey1.id,
//       answers: [
//         { questionId: 'q1', answer: 5 },
//         { questionId: 'q2', answer: 'Google Search' },
//         { questionId: 'q3', answer: 'Great service, keep it up!' },
//       ],
//       ipAddress: '192.168.1.1',
//       userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//     },
//   });

//   await prisma.response.create({
//     data: {
//       surveyId: survey1.id,
//       answers: [
//         { questionId: 'q1', answer: 4 },
//         { questionId: 'q2', answer: 'Social Media' },
//         { questionId: 'q3', answer: 'More features would be nice' },
//       ],
//       ipAddress: '192.168.1.2',
//       userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
//     },
//   });

//   console.log('✅ Created 2 sample responses');

//   console.log('\n🎉 Seeding completed successfully!');
//   console.log('\n📊 Summary:');
//   console.log(`  • Permissions: ${Object.keys(createdPermissions).length}`);
//   console.log('  • System Roles: 3 (Owner, Admin, Agent)');
//   console.log('  • Test Users: 2');
//   console.log('  • Test Surveys: 2');
//   console.log('  • Sample Responses: 2');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seeding failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


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

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  • Organizations: 1 (System)`);
  console.log(`  • Permissions: ${Object.keys(createdPermissions).length}`);
  console.log('  • System Roles: 3 (Owner, Admin, Agent)');
  console.log('  • Test Users: 2');
  console.log('  • Organization Members: 2');
  console.log('  • Test Surveys: 2');
  console.log('  • Sample Responses: 2');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });