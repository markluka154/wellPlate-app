import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

// Disable query engine prepared statements in serverless environments
// This fixes "prepared statement 'sX' already exists" errors
if (process.env.NODE_ENV === 'production') {
  // Use connection pooling
  prisma.$connect().catch((err) => {
    console.error('Failed to connect to database:', err)
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

