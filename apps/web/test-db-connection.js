const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test if User table exists
    const userCount = await prisma.user.count()
    console.log(`✅ User table accessible, count: ${userCount}`)
    
    // Test if new tables exist
    try {
      const profileCount = await prisma.userProfile.count()
      console.log(`✅ UserProfile table accessible, count: ${profileCount}`)
    } catch (error) {
      console.log('❌ UserProfile table error:', error.message)
    }
    
    try {
      const memoryCount = await prisma.coachMemory.count()
      console.log(`✅ CoachMemory table accessible, count: ${memoryCount}`)
    } catch (error) {
      console.log('❌ CoachMemory table error:', error.message)
    }
    
    try {
      const progressCount = await prisma.progressLog.count()
      console.log(`✅ ProgressLog table accessible, count: ${progressCount}`)
    } catch (error) {
      console.log('❌ ProgressLog table error:', error.message)
    }
    
    try {
      const sessionCount = await prisma.chatSession.count()
      console.log(`✅ ChatSession table accessible, count: ${sessionCount}`)
    } catch (error) {
      console.log('❌ ChatSession table error:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
