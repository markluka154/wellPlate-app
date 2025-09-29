
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Dynamic import to prevent build-time issues
    const { prisma } = await import('@/lib/supabase')
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'Database URL not configured'
      }, { status: 500 })
    }

    // Test database connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 })
  }
}