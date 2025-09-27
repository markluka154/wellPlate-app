const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testSimple() {
  try {
    console.log('🔍 Testing simple database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test if we can query the User table
    const users = await prisma.user.findMany({ take: 1 })
    console.log('✅ User table accessible, found users:', users.length)
    
    console.log('✅ Database test successful!')
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testSimple()

