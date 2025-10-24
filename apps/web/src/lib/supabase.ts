import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { Client } from 'pg'

// Supabase client for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not configured. Some features may not work.')
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// PostgreSQL client for direct database queries
// Don't create or connect during build time
let _client: Client | null = null

export const getClient = () => {
  if (!_client && process.env.DATABASE_URL) {
    _client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    // Connect lazily when first requested
    _client.connect().catch(console.error)
  }
  return _client
}

// For backwards compatibility - but don't connect at module level
export const client = process.env.DATABASE_URL ? new Client({
  connectionString: process.env.DATABASE_URL,
}) : null as any

// Singleton Prisma client for serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Proper Prisma client configuration for serverless
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Disable prepared statements in serverless environments
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Raw SQL query function to bypass prepared statements
export async function rawQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await prisma.$queryRawUnsafe(sql, ...params)
    return result as T[]
  } catch (error) {
    console.error('Raw query error:', error)
    throw error
  }
}

// Direct PostgreSQL connection to completely bypass Prisma
export async function directQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const { Client } = await import('pg')
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    // Disable prepared statements at the connection level
    statement_timeout: 30000,
    query_timeout: 30000,
  })
  
  try {
    await client.connect()
    const result = await client.query(sql, params)
    return result.rows as T[]
  } finally {
    await client.end()
  }
}

// Helper function to safely execute Prisma queries with proper error handling
export async function safePrismaQuery<T>(
  queryFn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await queryFn(prisma)
  } catch (error: any) {
    console.error('Prisma query error:', error)
    
    // Check for prepared statement error
    const errorMessage = error.message || error.toString() || ''
    const isPreparedStatementError = 
      errorMessage.includes('prepared statement') ||
      errorMessage.includes('already exists') ||
      error.code === '42P05'
    
    if (isPreparedStatementError) {
      console.log('Prepared statement conflict detected, retrying with fresh connection...')
      // Disconnect and reconnect
      await prisma.$disconnect()
      await prisma.$connect()
      // Retry once
      return await queryFn(prisma)
    }
    
    throw error
  }
}

export async function uploadPDF(buffer: Buffer, path: string): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client not configured. Please set up environment variables.')
  }

  const { data, error } = await supabase.storage
    .from('mealplans')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`)
  }

  return data.path
}

export async function createSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client not configured. Please set up environment variables.')
  }

  const { data, error } = await supabase.storage
    .from('mealplans')
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

export async function deletePDF(path: string): Promise<void> {
  if (!supabase) {
    console.warn('Supabase client not configured. Cannot delete PDF.')
    return
  }

  const { error } = await supabase.storage
    .from('mealplans')
    .remove([path])

  if (error) {
    console.error(`Failed to delete PDF: ${error.message}`)
  }
}
