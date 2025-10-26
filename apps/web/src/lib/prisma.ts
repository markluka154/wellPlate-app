import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Append ?pgbouncer=true to force session mode and disable prepared statements
  // This resolves conflicts with Supabase PgBouncer in both dev and production
  const databaseUrl = process.env.DATABASE_URL
  const urlWithPgBouncer = databaseUrl && !databaseUrl.includes('pgbouncer=true') 
    ? databaseUrl + (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true'
    : databaseUrl

  return new PrismaClient({
    datasources: {
      db: {
        url: urlWithPgBouncer,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  })
}

// In development, reuse a single instance
// In production (Vercel), create a new instance per request to avoid prepared statement conflicts with PgBouncer
const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

// Export a function to get a fresh client for production
export function getPrismaClient() {
  if (process.env.NODE_ENV === 'production') {
    // In production, always create a new instance to avoid prepared statement conflicts
    return createPrismaClient()
  }
  return prisma
}

