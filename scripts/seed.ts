const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('adminpassword', 10);

  // Original Admin (preserve existing logic)
  const originalAdmin = await prisma.user.upsert({
    where: { email: 'admin@monster.com' },
    update: {
      password: adminPassword,
      role: 'admin',
      is_approved: true,
    },
    create: {
      email: 'admin@monster.com',
      name: 'Admin Monster',
      password: adminPassword,
      role: 'admin',
      is_approved: true,
    },
  });

  // Test Admin (for E2E tests)
  const testAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password,
      role: 'admin',
      is_approved: true,
    },
    create: {
      email: 'admin@example.com',
      name: 'Test Admin',
      password,
      role: 'admin',
      is_approved: true,
    },
  });

  // Test User (for E2E tests)
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      password,
      role: 'user',
      is_approved: true,
    },
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password,
      role: 'user',
      is_approved: true,
    },
  });

  // Seed CompetencyTemplate for E2E tests
  const seedTemplate = await prisma.competencyTemplate.upsert({
    where: { id: 'seed-template-1' },
    update: {},
    create: {
      id: 'seed-template-1',
      name: 'Default Competency Template',
      fileName: 'default-template.xlsx',
      fileUrl: '/uploads/default-template.xlsx',
    },
  });
  console.log('Seeded competency template:', seedTemplate.id);

  // Seed JobStandard for E2E tests
  const seedJobStandard = await prisma.jobStandard.upsert({
    where: { id: 'seed-job-standard-1' },
    update: {},
    create: {
      id: 'seed-job-standard-1',
      jobName: 'Software Engineer',
      scoreExpectation: 85,
    },
  });
  console.log('Seeded job standard:', seedJobStandard.id);

  // Seed Scenario for E2E tests
  const seedScenario = await prisma.scenario.upsert({
    where: { id: 'seed-scenario-1' },
    update: {},
    create: {
      id: 'seed-scenario-1',
      name: 'Technical Assessment',
    },
  });
  console.log('Seeded scenario:', seedScenario.id);

  console.log({ originalAdmin, testAdmin, testUser, seedTemplate, seedJobStandard, seedScenario });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
