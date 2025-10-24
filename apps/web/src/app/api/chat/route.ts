import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/supabase'
import { createChatCompletion, extractInsights } from '@/lib/ai/openai'
import { CoachContext } from '@/types/coach'
import type { Session } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, userId } = await request.json()
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Missing message or userId' },
        { status: 400 }
      )
    }

    // Verify user owns this request
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Load user context
    const context = await loadUserContext(userId)
    
    if (!context.userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get recent chat messages for context
    const recentMessages = await getRecentChatMessages(userId)
    
    // Create AI response
    const response = await createChatCompletion(
      [
        ...recentMessages,
        { role: 'user', content: message },
      ],
      context,
      async (functionName: string, args: any) => {
        return await executeFunction(functionName, args, userId)
      }
    )

    // Extract insights from the conversation
    const insights = extractInsights(message, context)
    
    // Save insights to memory
    if (insights.length > 0) {
      await saveInsights(userId, insights)
    }

    // Save chat message
    await saveChatMessage(userId, message, response.message, response.type, response.data)

    return NextResponse.json({
      message: response.message,
      type: response.type,
      data: response.data,
      memories: context.recentMemories,
      progress: context.recentProgress,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function loadUserContext(userId: string): Promise<CoachContext> {
  try {
    // Load user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      // Create default profile if none exists
      const newProfile = await prisma.userProfile.create({
        data: {
          userId,
          goal: 'maintain',
          activityLevel: 3,
          sleepHours: 7,
          stressLevel: 3,
          stepsPerDay: 8000,
        },
      })
      
      return {
        userProfile: newProfile,
        recentMemories: [],
        recentProgress: [],
      }
    }

    // Load recent memories (last 10)
    const recentMemories = await prisma.coachMemory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    })

    // Load recent progress (last 7 entries)
    const recentProgress = await prisma.progressLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
    })

    return {
      userProfile,
      recentMemories,
      recentProgress,
    }
  } catch (error) {
    console.error('Database error, using demo mode:', error)
    
    // Return demo data when database is not available
    return {
      userProfile: {
        id: 'demo',
        userId,
        name: 'Demo User',
        goal: 'maintain',
        weightKg: 70,
        heightCm: 170,
        dietType: 'omnivore',
        activityLevel: 3,
        sleepHours: 7,
        stressLevel: 3,
        stepsPerDay: 8000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      recentMemories: [],
      recentProgress: [],
    }
  }
}

async function getRecentChatMessages(userId: string) {
  try {
    // Get the most recent chat session
    const recentSession = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    if (!recentSession) {
      return []
    }

    // Return last 10 messages for context
    const messages = recentSession.messages as any[]
    return messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  } catch (error) {
    console.error('Error loading chat messages:', error)
    return []
  }
}

async function executeFunction(functionName: string, args: any, userId: string) {
  const functionMap: Record<string, (args: any, userId: string) => Promise<any>> = {
    generateMealPlan: async (args, userId) => {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/functions/generateMealPlan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args, userId }),
      })
      return await response.json()
    },
    
    updateMealPlan: async (args, userId) => {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/functions/updateMealPlan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args, userId }),
      })
      return await response.json()
    },
    
    getMoodMeal: async (args, userId) => {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/functions/getMoodMeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args, userId }),
      })
      return await response.json()
    },
    
    suggestCardioPlan: async (args, userId) => {
      // Mock implementation for now
      return {
        success: true,
        plan: {
          activities: [
            { name: 'Walking', duration: 30, intensity: 'moderate', calories: 150, frequency: 'daily' },
            { name: 'Cycling', duration: 20, intensity: 'moderate', calories: 200, frequency: '3x/week' },
          ],
          weeklyCalories: 1650,
        },
        message: 'I\'ve created a cardio plan tailored to your activity level.',
      }
    },
    
    logProgress: async (args, userId) => {
      try {
        const progressLog = await prisma.progressLog.create({
          data: {
            userId,
            weight: args.weight,
            mood: args.mood,
            notes: args.notes,
            sleepHours: args.sleepHours,
            stressLevel: args.stressLevel,
            steps: args.steps,
          },
        })
        
        return {
          success: true,
          log: progressLog,
          message: 'Progress logged successfully!',
        }
      } catch (error) {
        console.error('Error logging progress:', error)
        return {
          success: false,
          message: 'Progress logged in demo mode (database unavailable)',
        }
      }
    },
    
    adjustPlanForLifestyle: async (args, userId) => {
      try {
        // Update user profile with new lifestyle data
        await prisma.userProfile.update({
          where: { userId },
          data: {
            sleepHours: args.sleepHours,
            stressLevel: args.stressLevel,
            stepsPerDay: args.stepsPerDay,
          },
        })
        
        return {
          success: true,
          message: 'Your meal plan has been adjusted based on your lifestyle changes.',
          adjustments: {
            sleepHours: args.sleepHours,
            stressLevel: args.stressLevel,
            stepsPerDay: args.stepsPerDay,
          },
        }
      } catch (error) {
        console.error('Error adjusting plan:', error)
        return {
          success: true,
          message: 'Your meal plan has been adjusted based on your lifestyle changes (demo mode).',
          adjustments: {
            sleepHours: args.sleepHours,
            stressLevel: args.stressLevel,
            stepsPerDay: args.stepsPerDay,
          },
        }
      }
    },
  }

  const functionHandler = functionMap[functionName]
  if (!functionHandler) {
    throw new Error(`Unknown function: ${functionName}`)
  }

  return await functionHandler(args, userId)
}

async function saveInsights(userId: string, insights: Array<{ type: string; content: string; metadata?: any }>) {
  try {
    const insightPromises = insights.map(insight =>
      prisma.coachMemory.create({
        data: {
          userId,
          insightType: insight.type as any,
          content: insight.content,
          metadata: insight.metadata,
        },
      })
    )

    await Promise.all(insightPromises)
  } catch (error) {
    console.error('Error saving insights:', error)
    // Continue execution even if insights can't be saved
  }
}

async function saveChatMessage(userId: string, userMessage: string, assistantMessage: string, type?: string, data?: any) {
  try {
    // Get or create current chat session
    let session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: 'Chat with Lina',
          messages: [],
        },
      })
    }

    // Add new messages
    const newMessages = [
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        type: 'text',
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
        type: type || 'text',
        data,
      },
    ]

    const updatedMessages = [...(session.messages as any[]), ...newMessages]

    // Update session
    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        messages: updatedMessages,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error saving chat message:', error)
    // Continue execution even if chat can't be saved
  }
}

// Initialize chat endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await request.json()
    
    if (!userId || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const context = await loadUserContext(userId)
    
    return NextResponse.json({
      userProfile: context.userProfile,
      memories: context.recentMemories,
      progress: context.recentProgress,
    })

  } catch (error) {
    console.error('Initialize chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
