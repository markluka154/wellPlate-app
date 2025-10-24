import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { directQuery } from '@/lib/supabase'
import type { Session } from 'next-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing AI Coach API...')
    
    // Test 1: Check session
    const session = await getServerSession(authOptions) as Session | null
    console.log('Session check:', session ? 'OK' : 'No session')
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No session', step: 'session' }, { status: 401 })
    }
    
    // Test 2: Check database connection with direct PostgreSQL
    try {
      await directQuery('SELECT 1 as test')
      console.log('Database connection: OK')
    } catch (error) {
      console.log('Database connection error:', error)
      return NextResponse.json({ error: 'Database connection failed', step: 'db_connect', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
    
    // Test 3: Check if User table exists using direct PostgreSQL
    try {
      const userResult = await directQuery('SELECT COUNT(*) as count FROM "User"')
      const userCount = userResult[0]?.count || 0
      console.log('User table access: OK, count:', userCount)
    } catch (error) {
      console.log('User table error:', error)
      return NextResponse.json({ error: 'User table access failed', step: 'user_table', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
    
    // Test 4: Check if UserProfile table exists using direct PostgreSQL
    try {
      const profileResult = await directQuery('SELECT COUNT(*) as count FROM "UserProfile"')
      const profileCount = profileResult[0]?.count || 0
      console.log('UserProfile table access: OK, count:', profileCount)
    } catch (error) {
      console.log('UserProfile table error:', error)
      return NextResponse.json({ error: 'UserProfile table access failed', step: 'profile_table', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
    
    // Test 5: Try to create a test user profile using direct PostgreSQL
    try {
      // First check if profile exists
      const existingProfile = await directQuery('SELECT id FROM "UserProfile" WHERE "userId" = $1', [session.user.id])
      
      if (existingProfile.length > 0) {
        console.log('UserProfile already exists:', existingProfile[0].id)
      } else {
        // Create new profile using direct PostgreSQL
        const insertResult = await directQuery(`
          INSERT INTO "UserProfile" ("id", "userId", "goal", "activityLevel", "sleepHours", "stressLevel", "stepsPerDay", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          crypto.randomUUID(),
          session.user.id,
          'maintain',
          3,
          7,
          3,
          8000,
          new Date(),
          new Date()
        ])
        console.log('UserProfile created: OK', insertResult[0]?.id)
      }
    } catch (error) {
      console.log('UserProfile creation error:', error)
      return NextResponse.json({ error: 'UserProfile creation failed', step: 'profile_create', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All tests passed!',
      userId: session.user.id,
      tests: ['session', 'db_connect', 'user_table', 'profile_table', 'profile_create']
    })
    
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      step: 'general',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
