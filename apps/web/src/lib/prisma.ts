import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Use a new connection for each request in production (serverless)
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

// Disable prepared statements to fix "prepared statement already exists" errors in Vercel
// This creates a new client for each serverless invocation
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

