import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testing database connection in API...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test if we can query the User table
    const userCount = await prisma.user.count()
    console.log('✅ User table accessible, count:', userCount)
    
    // Test if we can query the Subscription table
    const subCount = await prisma.subscription.count()
    console.log('✅ Subscription table accessible, count:', subCount)
    
    return NextResponse.json({ 
      success: true, 
      userCount, 
      subCount,
      message: 'Database connection working!' 
    })

  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
