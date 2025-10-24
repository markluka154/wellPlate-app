import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/supabase'
import type { Session } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing AI Coach API...')
    
    // Test 1: Check session
    const session = await getServerSession(authOptions) as Session | null
    console.log('Session check:', session ? 'OK' : 'No session')
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No session', step: 'session' }, { status: 401 })
    }
    
    // Test 2: Check database connection
    try {
      await prisma.$connect()
      console.log('Database connection: OK')
    } catch (error) {
      console.log('Database connection error:', error)
      return NextResponse.json({ error: 'Database connection failed', step: 'db_connect', details: error.message }, { status: 500 })
    }
    
    // Test 3: Check if User table exists
    try {
      const userCount = await prisma.user.count()
      console.log('User table access: OK, count:', userCount)
    } catch (error) {
      console.log('User table error:', error)
      return NextResponse.json({ error: 'User table access failed', step: 'user_table', details: error.message }, { status: 500 })
    }
    
    // Test 4: Check if UserProfile table exists
    try {
      const profileCount = await prisma.userProfile.count()
      console.log('UserProfile table access: OK, count:', profileCount)
    } catch (error) {
      console.log('UserProfile table error:', error)
      return NextResponse.json({ error: 'UserProfile table access failed', step: 'profile_table', details: error.message }, { status: 500 })
    }
    
    // Test 5: Try to create a test user profile
    try {
      const testProfile = await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {},
        create: {
          userId: session.user.id,
          goal: 'maintain',
          activityLevel: 3,
          sleepHours: 7,
          stressLevel: 3,
          stepsPerDay: 8000,
        },
      })
      console.log('UserProfile creation: OK', testProfile.id)
    } catch (error) {
      console.log('UserProfile creation error:', error)
      return NextResponse.json({ error: 'UserProfile creation failed', step: 'profile_create', details: error.message }, { status: 500 })
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
      details: error.message 
    }, { status: 500 })
  }
}
