const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test if we can query the User table
    const userCount = await prisma.user.count()
    console.log('✅ User table accessible, count:', userCount)
    
    // Test if we can query the Subscription table
    const subCount = await prisma.subscription.count()
    console.log('✅ Subscription table accessible, count:', subCount)
    
    // Test creating a user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
      },
    })
    console.log('✅ Test user created/found:', testUser.id)
    
    // Test creating a subscription
    const testSub = await prisma.subscription.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        plan: 'FREE',
        status: 'active',
      },
    })
    console.log('✅ Test subscription created/found:', testSub.id)
    
    console.log('✅ All database operations working correctly!')
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
