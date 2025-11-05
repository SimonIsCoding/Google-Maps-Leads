import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin123!', 12)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mapscraperhub.com' },
    update: {},
    create: {
      email: 'admin@mapscraperhub.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      credits: 1000,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: await bcrypt.hash('Test123!', 12),
      role: 'USER',
      credits: 100,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Test user created:', testUser.email)

  // Create some sample searches for the test user
  const search1 = await prisma.search.create({
    data: {
      userId: testUser.id,
      requestId: 'sample-request-1',
      query: 'boulangerie Paris 11',
      maxRows: 25,
      status: 'SUCCESS',
      rowsReturned: 25,
      sheetUrl: 'https://docs.google.com/spreadsheets/d/example1',
      creditsUsed: 15,
      completedAt: new Date(),
    },
  })

  console.log('✅ Sample search 1 created:', search1.id)

  const search2 = await prisma.search.create({
    data: {
      userId: testUser.id,
      requestId: 'sample-request-2',
      query: 'restaurant Lyon',
      maxRows: 50,
      status: 'SUCCESS',
      rowsReturned: 47,
      sheetUrl: 'https://docs.google.com/spreadsheets/d/example2',
      creditsUsed: 37,
      completedAt: new Date(Date.now() - 86400000), // 1 day ago
    },
  })

  console.log('✅ Sample search 2 created:', search2.id)

  // Create pending search
  const search3 = await prisma.search.create({
    data: {
      userId: testUser.id,
      requestId: 'sample-request-3',
      query: 'cafe Marseille',
      maxRows: 10,
      status: 'PENDING',
    },
  })

  console.log('✅ Sample search 3 created:', search3.id)

  // Create transactions
  await prisma.transaction.create({
    data: {
      userId: testUser.id,
      type: 'PURCHASE',
      amount: 100,
      description: 'Initial credit purchase - 100 credits',
      stripeSessionId: 'cs_test_example',
    },
  })

  await prisma.transaction.create({
    data: {
      userId: testUser.id,
      type: 'USAGE',
      amount: -15,
      description: 'Credits used for search: boulangerie Paris 11',
      searchId: search1.id,
    },
  })

  await prisma.transaction.create({
    data: {
      userId: testUser.id,
      type: 'USAGE',
      amount: -37,
      description: 'Credits used for search: restaurant Lyon',
      searchId: search2.id,
    },
  })

  console.log('✅ Transactions created')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@mapscraperhub.com / Admin123!')
  console.log('Test User: test@example.com / Test123!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
