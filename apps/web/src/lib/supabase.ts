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

// Singleton Prisma client to avoid prepared statement conflicts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a function that returns a fresh Prisma client
export function getPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['error'],
  })
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Raw SQL query function to bypass prepared statements
export async function rawQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = getPrismaClient()
  try {
    const result = await client.$queryRawUnsafe(sql, ...params)
    return result as T[]
  } finally {
    await client.$disconnect()
  }
}

// Helper function to safely execute Prisma queries
export async function safePrismaQuery<T>(
  queryFn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient()
  
  try {
    return await queryFn(client)
  } catch (error: any) {
    console.log('Prisma query error:', error)
    
    // Check for prepared statement error in multiple ways
    const errorMessage = error.message || error.toString() || ''
    const isPreparedStatementError = 
      errorMessage.includes('prepared statement') ||
      errorMessage.includes('already exists') ||
      error.code === '42P05' ||
      (error.kind && error.kind.QueryError && error.kind.QueryError.PostgresError && error.kind.QueryError.PostgresError.code === '42P05')
    
    if (isPreparedStatementError) {
      console.log('Prepared statement conflict detected, creating fresh client...')
      try {
        // Create a completely fresh client
        const freshClient = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
          log: ['error'],
        })
        
        console.log('Using fresh client, retrying query...')
        const result = await queryFn(freshClient)
        
        // Clean up the fresh client
        await freshClient.$disconnect()
        
        return result
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        throw retryError
      }
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
