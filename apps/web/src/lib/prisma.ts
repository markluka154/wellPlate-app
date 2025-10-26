import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Create singleton client with connection management
if (process.env.NODE_ENV === 'production') {
  // In production, create a fresh instance each time to avoid prepared statement conflicts
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  })
  
  // Disconnect on request completion
  if (typeof window === 'undefined') {
    process.on('beforeExit', async () => {
      await prisma.$disconnect()
    })
  }
} else {
  // In development, reuse the same instance
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['error', 'warn'],
  })
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma
  }
}

export default prisma

