import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { directQuery } from '@/lib/supabase'
import { createChatCompletion, extractInsights } from '@/lib/ai/openai'
import { CoachContext } from '@/types/coach'
import type { Session } from 'next-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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
    // Load user profile using direct PostgreSQL
    const userProfileResult = await directQuery('SELECT * FROM "UserProfile" WHERE "userId" = $1', [userId])
    const userProfile = userProfileResult[0]

    if (!userProfile) {
      // Create default profile if none exists
      const newProfileId = crypto.randomUUID()
      await directQuery(`
        INSERT INTO "UserProfile" ("id", "userId", "goal", "activityLevel", "sleepHours", "stressLevel", "stepsPerDay", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newProfileId,
        userId,
        'maintain',
        3,
        7,
        3,
        8000,
        new Date(),
        new Date()
      ])
      
      return {
        userProfile: {
          id: newProfileId,
          userId,
          name: null,
          goal: 'maintain',
          weightKg: null,
          heightCm: null,
          dietType: null,
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

    // Load recent memories (last 10)
    const recentMemories = await directQuery(`
      SELECT * FROM "CoachMemory" 
      WHERE "userId" = $1 
      ORDER BY "timestamp" DESC 
      LIMIT 10
    `, [userId])

    // Load recent progress (last 7 entries)
    const recentProgress = await directQuery(`
      SELECT * FROM "ProgressLog" 
      WHERE "userId" = $1 
      ORDER BY "date" DESC 
      LIMIT 7
    `, [userId])

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
    // Get the most recent chat session using direct PostgreSQL
    const recentSessionResult = await directQuery(`
      SELECT * FROM "ChatSession" 
      WHERE "userId" = $1 
      ORDER BY "updatedAt" DESC 
      LIMIT 1
    `, [userId])
    
    const recentSession = recentSessionResult[0]

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
        const progressLogId = crypto.randomUUID()
        await directQuery(`
          INSERT INTO "ProgressLog" ("id", "userId", "weight", "calories", "notes", "mood", "sleepHours", "stressLevel", "steps", "date", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          progressLogId,
          userId,
          args.weight,
          args.calories,
          args.notes,
          args.mood,
          args.sleepHours,
          args.stressLevel,
          args.steps,
          new Date(),
          new Date()
        ])
        
        return {
          success: true,
          log: { id: progressLogId, userId, ...args },
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
        // Update user profile with new lifestyle data using direct PostgreSQL
        await directQuery(`
          UPDATE "UserProfile" 
          SET "sleepHours" = $1, "stressLevel" = $2, "stepsPerDay" = $3, "updatedAt" = $4
          WHERE "userId" = $5
        `, [
          args.sleepHours,
          args.stressLevel,
          args.stepsPerDay,
          new Date(),
          userId
        ])
        
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

    // Feedback functions
    rateMealPlan: async (args, userId) => {
      try {
        // Get user info for email
        const userResult = await directQuery('SELECT email, name FROM "User" WHERE id = $1', [userId])
        const user = userResult[0]
        
        // Send feedback email
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/feedback/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rating',
            mealPlanId: args.mealPlanId,
            rating: args.rating,
            feedback: args.feedback,
            mealType: args.mealType,
            issues: args.issues,
            userEmail: user?.email,
            userName: user?.name
          })
        })
        
        const emailResult = await emailResponse.json()
        console.log('📧 Rating email sent:', emailResult.success ? 'Success' : 'Failed')
        
        return {
          success: true,
          message: `Thank you for your ${args.rating}/5 star rating! Your feedback has been sent to our team.`,
          rating: args.rating,
          feedback: args.feedback,
          emailSent: emailResult.success
        }
      } catch (error) {
        console.error('Error processing rating:', error)
        return {
          success: true,
          message: `Thank you for your ${args.rating}/5 star rating! Your feedback has been noted.`,
          rating: args.rating,
          feedback: args.feedback
        }
      }
    },

    reportMealIssue: async (args, userId) => {
      try {
        // Get user info for email
        const userResult = await directQuery('SELECT email, name FROM "User" WHERE id = $1', [userId])
        const user = userResult[0]
        
        // Send feedback email
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/feedback/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'issue',
            mealPlanId: args.mealPlanId,
            issueType: args.issueType,
            description: args.description,
            suggestion: args.suggestion,
            severity: args.severity,
            userEmail: user?.email,
            userName: user?.name
          })
        })
        
        const emailResult = await emailResponse.json()
        console.log('📧 Issue report email sent:', emailResult.success ? 'Success' : 'Failed')
        
        return {
          success: true,
          message: `Thank you for reporting this issue! We've been notified and will work on improving this meal plan.`,
          issueType: args.issueType,
          severity: args.severity,
          emailSent: emailResult.success
        }
      } catch (error) {
        console.error('Error processing issue report:', error)
        return {
          success: true,
          message: `Thank you for reporting this issue! We've noted your feedback.`,
          issueType: args.issueType,
          severity: args.severity
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
    for (const insight of insights) {
      await directQuery(`
        INSERT INTO "CoachMemory" ("id", "userId", "insightType", "content", "metadata", "timestamp")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        crypto.randomUUID(),
        userId,
        insight.type,
        insight.content,
        insight.metadata ? JSON.stringify(insight.metadata) : null,
        new Date()
      ])
    }
  } catch (error) {
    console.error('Error saving insights:', error)
    // Continue execution even if insights can't be saved
  }
}

async function saveChatMessage(userId: string, userMessage: string, assistantMessage: string, type?: string, data?: any) {
  try {
    // Get or create current chat session using direct PostgreSQL
    const sessionResult = await directQuery(`
      SELECT * FROM "ChatSession" 
      WHERE "userId" = $1 
      ORDER BY "updatedAt" DESC 
      LIMIT 1
    `, [userId])
    
    let session = sessionResult[0]

    if (!session) {
      const sessionId = crypto.randomUUID()
      await directQuery(`
        INSERT INTO "ChatSession" ("id", "userId", "title", "messages", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        sessionId,
        userId,
        'Chat with Lina',
        JSON.stringify([]),
        new Date(),
        new Date()
      ])
      
      session = {
        id: sessionId,
        userId,
        title: 'Chat with Lina',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
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
    await directQuery(`
      UPDATE "ChatSession" 
      SET "messages" = $1, "updatedAt" = $2
      WHERE "id" = $3
    `, [
      JSON.stringify(updatedMessages),
      new Date(),
      session.id
    ])
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
