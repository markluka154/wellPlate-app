import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, userId } = await request.json()
    console.log('Message received:', message)
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Missing message or userId' },
        { status: 400 }
      )
    }

    // Simple response for testing
    return NextResponse.json({
      text: `Hello! I received your message: "${message}". This is a test response from the AI Coach.`,
      type: 'text'
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// Initialize chat endpoint
export async function PUT(request: NextRequest) {
  try {
    console.log('Chat initialization called')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await request.json()
    console.log('User ID:', userId)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Simple initialization response
    return NextResponse.json({
      userProfile: {
        id: 'test',
        userId: userId,
        name: 'Test User',
        goal: 'maintain',
        activityLevel: 3,
        sleepHours: 7,
        stressLevel: 3,
        stepsPerDay: 8000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      memories: [],
      progress: [],
      message: 'Chat initialized successfully'
    })
    
  } catch (error) {
    console.error('Chat initialization error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize chat',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
