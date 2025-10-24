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

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to safely execute Prisma queries
export async function safePrismaQuery<T>(
  queryFn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await queryFn(prisma)
  } catch (error: any) {
    // If it's a prepared statement error, disconnect and reconnect
    if (error.message?.includes('prepared statement') || error.code === '42P05') {
      console.log('Prepared statement conflict detected, reconnecting...')
      await prisma.$disconnect()
      await prisma.$connect()
      // Retry the query once
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
