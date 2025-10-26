import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// In production (Vercel), create a new client for each request to avoid prepared statement conflicts
// In development, reuse the same client for better performance
const prisma =
  process.env.NODE_ENV === 'production'
    ? new PrismaClient({
        log: ['error', 'warn'],
      })
    : globalForPrisma.prisma ?? new PrismaClient({
        log: ['error', 'warn'],
      })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

